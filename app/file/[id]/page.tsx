import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { locate, type DriveItem } from "@/lib/googleDrive";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { fileKind, formatSize } from "@/components/ItemList";

export default function FilePage({ params }: PageProps<"/file/[id]">) {
  return (
    <Suspense fallback={<div className="h-[80vh] animate-pulse rounded-xl bg-slate-200" />}>
      <FileContent params={params} />
    </Suspense>
  );
}

async function FileContent({ params }: Pick<PageProps<"/file/[id]">, "params">) {
  await requireUser();
  const { id } = await params;

  const found = await locate(id);
  if (!found) notFound();
  if (found.item.isFolder) redirect(`/library/${id}`);

  const { item, path } = found;
  const src = `/api/file/${item.id}`;

  return (
    <>
      <title>{`${item.name} · Brass Band Library`}</title>
      <Breadcrumbs path={path.slice(0, -1)} current={item.name} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{item.name}</h1>
          <p className="text-sm text-slate-500">
            {fileKind(item.mimeType)}
            {item.size != null && ` · ${formatSize(item.size)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50"
          >
            Open in new tab
          </a>
          <a
            href={`${src}?download`}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Download
          </a>
        </div>
      </div>

      <Preview item={item} src={src} />
    </>
  );
}

function Preview({ item, src }: { item: DriveItem; src: string }) {
  const kind = fileKind(item.mimeType);

  if (kind === "PDF" || kind === "Google doc") {
    return (
      <iframe
        src={src}
        title={item.name}
        className="h-[80vh] w-full rounded-xl border border-slate-200 bg-white"
      />
    );
  }
  if (kind === "Image") {
    // eslint-disable-next-line @next/next/no-img-element -- streamed from our own authenticated route
    return <img src={src} alt={item.name} className="mx-auto rounded-xl shadow" />;
  }
  if (kind === "Audio") {
    return <audio src={src} controls className="w-full" />;
  }
  if (kind === "Video") {
    return <video src={src} controls className="w-full rounded-xl" />;
  }
  return (
    <p className="rounded-xl bg-white p-6 text-slate-600 shadow">
      This file can’t be previewed in the browser. Use Download to open it.
    </p>
  );
}
