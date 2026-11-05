import { Readable } from "node:stream";
import { getCurrentUser } from "@/lib/auth";
import { locate, openFile } from "@/lib/googleDrive";

// Types safe to show inline in the browser. Anything else is forced to download,
// so an uploaded HTML/SVG file can never run script on this site's origin.
const INLINE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "video/mp4",
]);

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/file/[id]">
) {
  if (!(await getCurrentUser())) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const found = await locate(id);
  if (!found || found.item.isFolder) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { stream, mimeType, filename } = await openFile(found.item);
    const wantsDownload = new URL(request.url).searchParams.has("download");
    const disposition =
      wantsDownload || !INLINE_TYPES.has(mimeType) ? "attachment" : "inline";
    const asciiName = filename.replace(/[^\x20-\x7E]|["\\]/g, "_");

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": INLINE_TYPES.has(mimeType)
          ? mimeType
          : "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Failed to stream file", id, error);
    return Response.json({ error: "Failed to load file" }, { status: 502 });
  }
}
