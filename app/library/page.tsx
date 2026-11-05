import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { libraryRootId, listFolder, searchLibrary } from "@/lib/googleDrive";
import { ItemList, ListSkeleton, fileKind } from "@/components/ItemList";
import { SearchBox } from "@/components/SearchBox";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage({ searchParams }: PageProps<"/library">) {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold text-slate-800">Music Library</h1>
      <Suspense fallback={<ListSkeleton />}>
        <LibraryContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LibraryContent({
  searchParams,
}: Pick<PageProps<"/library">, "searchParams">) {
  await requireUser();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  return (
    <>
      <SearchBox defaultValue={query} />
      {query ? (
        <SearchResults query={query} />
      ) : (
        <ItemList
          items={await listFolder(libraryRootId())}
          emptyMessage="No music has been added yet."
        />
      )}
    </>
  );
}

async function SearchResults({ query }: { query: string }) {
  const results = await searchLibrary(query);

  return (
    <section>
      <p className="mb-4 text-sm text-slate-600">
        {results.length} result{results.length === 1 ? "" : "s"} for “{query}” ·{" "}
        <Link href="/library" className="text-blue-700 hover:underline">
          Clear search
        </Link>
      </p>
      {results.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-slate-500 shadow">
          Nothing matched. Try the first word of a title.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow">
          {results.map(({ item, path }) => (
            <li key={item.id}>
              <Link
                href={item.isFolder ? `/library/${item.id}` : `/file/${item.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50"
              >
                <span aria-hidden className="text-xl">{item.isFolder ? "📁" : "🎼"}</span>
                <span className="flex-1 truncate">
                  <span className="block truncate text-slate-800">{item.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {path.slice(0, -1).map((c) => c.name).join(" / ")}
                  </span>
                </span>
                <span className="text-xs text-slate-500">
                  {item.isFolder ? "Folder" : fileKind(item.mimeType)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
