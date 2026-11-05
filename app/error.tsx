"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl bg-white p-8 shadow">
      <h1 className="text-xl font-semibold text-slate-800">
        Couldn’t load the library
      </h1>
      <p className="mt-2 text-slate-600">
        Google Drive may be unavailable. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
