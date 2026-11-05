import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl bg-white p-8 shadow">
      <h1 className="text-xl font-semibold text-slate-800">Not found</h1>
      <p className="mt-2 text-slate-600">
        That music isn’t in the library, or it has been moved.
      </p>
      <Link href="/library" className="mt-4 inline-block text-blue-700 hover:underline">
        ← Back to the library
      </Link>
    </div>
  );
}
