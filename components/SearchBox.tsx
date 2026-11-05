import Form from "next/form";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <Form action="/library" className="mb-6 flex gap-2" role="search">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search the whole library…"
        aria-label="Search music"
        className="flex-1 rounded-lg border border-slate-300 bg-white p-3"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-5 font-medium text-white hover:bg-blue-700"
      >
        Search
      </button>
    </Form>
  );
}
