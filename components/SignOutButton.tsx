"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { endSession } from "@/lib/sessionClient";

export function SignOutButton() {
  async function handleSignOut() {
    await signOut(auth);
    await endSession();
    // Full page load so no signed-in pages stay in the client router cache.
    window.location.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
    >
      Sign out
    </button>
  );
}
