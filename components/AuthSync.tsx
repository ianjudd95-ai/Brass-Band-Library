"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { endSession, startSession } from "@/lib/sessionClient";

// Firebase refreshes ID tokens hourly while a tab is open; mirror each new
// token into the session cookie so the server-side check keeps passing.
export function AuthSync() {
  useEffect(
    () =>
      onIdTokenChanged(auth, (user) => {
        (user ? startSession(user) : endSession()).catch(() => {});
      }),
    []
  );

  return null;
}
