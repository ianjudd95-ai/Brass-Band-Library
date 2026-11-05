import Link from "next/link";
import type { DriveItem } from "@/lib/googleDrive";

export function fileKind(mimeType: string) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("application/vnd.google-apps.")) return "Google doc";
  return "File";
}

export function formatSize(bytes: number | null) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ItemList({
  items,
  emptyMessage = "This folder is empty.",
}: {
  items: DriveItem[];
  emptyMessage?: string;
}) {
  const folders = items.filter((i) => i.isFolder);
  const files = items.filter((i) => !i.isFolder);

  if (items.length === 0) {
    return <p className="rounded-xl bg-white p-6 text-slate-500 shadow">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-8">
      {folders.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <li key={folder.id}>
              <Link
                href={`/library/${folder.id}`}
                className="flex h-full items-center gap-3 rounded-xl bg-white p-5 shadow transition hover:shadow-lg"
              >
                <span aria-hidden className="text-2xl">📁</span>
                <span className="font-semibold text-slate-800">{folder.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow">
          {files.map((file) => (
            <li key={file.id}>
              <Link
                href={`/file/${file.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50"
              >
                <span aria-hidden className="text-xl">🎼</span>
                <span className="flex-1 truncate text-slate-800">{file.name}</span>
                <span className="text-xs text-slate-500">
                  {fileKind(file.mimeType)}
                  {file.size != null && ` · ${formatSize(file.size)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-16 rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}
