import Link from "next/link";
import type { Crumb } from "@/lib/googleDrive";

export function folderHref(id: string, isRoot: boolean) {
  return isRoot ? "/library" : `/library/${id}`;
}

/** Shows every crumb as a link; pass the item itself as `current` to show it unlinked. */
export function Breadcrumbs({ path, current }: { path: Crumb[]; current?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        {path.map((crumb, i) => (
          <li key={crumb.id} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            <Link
              href={folderHref(crumb.id, i === 0)}
              className="hover:text-blue-700 hover:underline"
            >
              {crumb.name}
            </Link>
          </li>
        ))}
        {current && (
          <li className="flex items-center gap-1">
            <span aria-hidden>/</span>
            <span className="text-slate-800" aria-current="page">
              {current}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
