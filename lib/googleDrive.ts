import "server-only";

import type { Readable } from "node:stream";
import { google, type drive_v3 } from "googleapis";
import { cacheLife } from "next/cache";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const GOOGLE_APPS_PREFIX = "application/vnd.google-apps.";
const MAX_DEPTH = 25;

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
  size: number | null;
  modifiedTime: string | null;
}

export interface Crumb {
  id: string;
  name: string;
}

export interface LocatedItem {
  item: DriveItem;
  /** Folders from the library root down to (and including) the item. */
  path: Crumb[];
}

export function libraryRootId() {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id) throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set");
  return id;
}

export function isDriveId(id: string) {
  return /^[A-Za-z0-9_-]{10,128}$/.test(id);
}

let client: drive_v3.Drive | undefined;

function drive() {
  client ??= google.drive({
    version: "v3",
    auth: new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    }),
  });
  return client;
}

const ITEM_FIELDS = "id,name,mimeType,size,modifiedTime";

function toItem(file: drive_v3.Schema$File): DriveItem {
  return {
    id: file.id ?? "",
    name: file.name ?? "Untitled",
    mimeType: file.mimeType ?? "application/octet-stream",
    isFolder: file.mimeType === FOLDER_MIME,
    size: file.size ? Number(file.size) : null,
    modifiedTime: file.modifiedTime ?? null,
  };
}

function isNotFound(error: unknown) {
  const e = error as { status?: number; code?: number | string };
  return e?.status === 404 || e?.code === 404 || e?.code === "404";
}

/** Contents of a folder, folders first, then natural name order. */
export async function listFolder(folderId: string): Promise<DriveItem[]> {
  "use cache";
  cacheLife("minutes");

  if (!isDriveId(folderId)) return [];

  const items: DriveItem[] = [];
  let pageToken: string | undefined;

  do {
    const { data } = await drive().files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: `nextPageToken, files(${ITEM_FIELDS})`,
      orderBy: "folder,name_natural",
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    items.push(...(data.files ?? []).map(toItem));
    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken);

  return items;
}

/**
 * Looks up an item and confirms it lives inside the library folder.
 * Returns null for unknown ids and anything outside the library, so the
 * service account can never be used to reach other Drive content.
 */
export async function locate(id: string): Promise<LocatedItem | null> {
  "use cache";
  cacheLife("minutes");

  if (!isDriveId(id)) return null;

  const rootId = libraryRootId();
  const path: Crumb[] = [];
  let item: DriveItem | null = null;
  let currentId = id;

  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    let file: drive_v3.Schema$File;
    try {
      ({ data: file } = await drive().files.get({
        fileId: currentId,
        fields: `${ITEM_FIELDS},parents,trashed`,
        supportsAllDrives: true,
      }));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }

    if (file.trashed) return null;

    const isRoot = currentId === rootId;
    const crumb = { id: currentId, name: isRoot ? "Library" : file.name ?? "Untitled" };
    path.unshift(crumb);
    item ??= { ...toItem(file), name: crumb.name };

    if (isRoot) return { item, path };

    const parentId = file.parents?.[0];
    if (!parentId) return null;
    currentId = parentId;
  }

  return null;
}

export interface SearchResult {
  item: DriveItem;
  path: Crumb[];
}

/** Name search across the whole library (Drive matches word prefixes). */
export async function searchLibrary(query: string): Promise<SearchResult[]> {
  "use cache";
  cacheLife("minutes");

  const term = query.trim().slice(0, 100);
  if (!term) return [];

  const escaped = term.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const { data } = await drive().files.list({
    q: `name contains '${escaped}' and trashed = false`,
    fields: `files(${ITEM_FIELDS})`,
    orderBy: "folder,name_natural",
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const located = await Promise.all(
    (data.files ?? []).map((file) => (file.id ? locate(file.id) : null))
  );

  return located.filter((r): r is LocatedItem => r !== null && r.path.length > 1);
}

export interface FileStream {
  stream: Readable;
  mimeType: string;
  filename: string;
}

/** Streams a file's bytes. Google Docs/Sheets/Slides are exported as PDF. */
export async function openFile(item: DriveItem): Promise<FileStream> {
  if (item.mimeType.startsWith(GOOGLE_APPS_PREFIX)) {
    const res = await drive().files.export(
      { fileId: item.id, mimeType: "application/pdf" },
      { responseType: "stream" }
    );
    return {
      stream: res.data as unknown as Readable,
      mimeType: "application/pdf",
      filename: `${item.name}.pdf`,
    };
  }

  const res = await drive().files.get(
    { fileId: item.id, alt: "media", supportsAllDrives: true },
    { responseType: "stream" }
  );
  return {
    stream: res.data as unknown as Readable,
    mimeType: item.mimeType,
    filename: item.name,
  };
}
