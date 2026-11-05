import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { libraryRootId, listFolder, locate } from "@/lib/googleDrive";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ItemList, ListSkeleton } from "@/components/ItemList";

export default function FolderPage({ params }: PageProps<"/library/[id]">) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <FolderContent params={params} />
    </Suspense>
  );
}

async function FolderContent({ params }: Pick<PageProps<"/library/[id]">, "params">) {
  await requireUser();
  const { id } = await params;

  if (id === libraryRootId()) redirect("/library");

  const found = await locate(id);
  if (!found) notFound();
  if (!found.item.isFolder) redirect(`/file/${id}`);

  const items = await listFolder(id);

  return (
    <>
      <title>{`${found.item.name} · Brass Band Library`}</title>
      <Breadcrumbs path={found.path.slice(0, -1)} current={found.item.name} />
      <h1 className="mb-6 text-3xl font-bold text-slate-800">{found.item.name}</h1>
      <ItemList items={items} />
    </>
  );
}
