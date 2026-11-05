// Verifies Firebase Auth ID tokens using Google's published public keys.
// Shared by proxy.ts and server code; needs no admin credentials, only the project id.
import { createRemoteJWKSet, jwtVerify } from "jose";

export const SESSION_COOKIE = "__session";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const firebaseKeys = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export interface SessionUser {
  uid: string;
  email: string | null;
  /** Token expiry, seconds since epoch. */
  exp: number;
}

export async function verifyIdToken(
  token: string | undefined
): Promise<SessionUser | null> {
  if (!token || !projectId) return null;

  try {
    const { payload } = await jwtVerify(token, firebaseKeys, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    });

    if (!payload.sub || typeof payload.exp !== "number") return null;

    return {
      uid: payload.sub,
      email: typeof payload.email === "string" ? payload.email : null,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
