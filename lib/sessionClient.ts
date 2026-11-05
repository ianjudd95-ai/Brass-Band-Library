import type { User } from "firebase/auth";

/** Sends the user's current ID token to the server to (re)set the session cookie. */
export async function startSession(user: User) {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: await user.getIdToken() }),
  });
  if (!response.ok) throw new Error("Could not start session");
}

export async function endSession() {
  await fetch("/api/session", { method: "DELETE" });
}
