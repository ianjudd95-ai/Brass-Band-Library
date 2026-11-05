import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyIdToken } from "./firebaseToken";

/** The signed-in user, or null. Reads the request cookie, so call it inside <Suspense>. */
export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifyIdToken(token);
}

/** Like getCurrentUser, but sends anonymous visitors to the login page. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
