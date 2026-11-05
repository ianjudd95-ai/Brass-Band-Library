"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { startSession } from "@/lib/sessionClient";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

/** Only allow redirects back into this site. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/library";
}

function friendlyError(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/invalid-email":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact the band librarian.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a few minutes and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
    }
  }
  return "Something went wrong signing in. Please try again.";
}

function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [busy, setBusy] = useState(true); // true until we know whether a user is already signed in

  // Single place that turns a Firebase sign-in into a server session and redirects.
  // Also covers returning members whose session cookie expired but who are still
  // signed in to Firebase in this browser.
  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setBusy(false);
          return;
        }
        try {
          await startSession(user);
          router.replace(next);
          router.refresh();
        } catch {
          setMessage({ text: "Could not start your session. Please try again.", isError: true });
          setBusy(false);
        }
      }),
    [next, router]
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setMessage({ text: friendlyError(error), isError: true });
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setMessage({ text: "Enter your email address first.", isError: true });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // Don't reveal whether the address has an account.
    }
    setMessage({
      text: "If that address has an account, a password reset email is on its way.",
      isError: false,
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-md"
      >
        <h1 className="mb-1 text-2xl font-bold">Sign in</h1>
        <p className="mb-6 text-sm text-slate-600">
          Accounts are created by the band librarian.
        </p>

        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className="mb-4 w-full rounded-md border border-slate-300 p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          className="mb-6 w-full rounded-md border border-slate-300 p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? "Please wait…" : "Sign in"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="mt-3 w-full text-sm text-blue-700 hover:underline"
        >
          Forgot password?
        </button>

        {message && (
          <p
            role={message.isError ? "alert" : "status"}
            className={`mt-4 text-sm ${message.isError ? "text-red-700" : "text-green-700"}`}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
