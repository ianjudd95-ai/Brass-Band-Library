import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyIdToken } from "@/lib/firebaseToken";

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

// Exchange a Firebase ID token (from the browser) for an httpOnly session cookie.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Bad origin" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    idToken?: unknown;
  } | null;
  const idToken = typeof body?.idToken === "string" ? body.idToken : undefined;

  const user = await verifyIdToken(idToken);
  if (!user || !idToken) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  (await cookies()).set(SESSION_COOKIE, idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(user.exp * 1000),
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Bad origin" }, { status: 403 });
  }

  (await cookies()).delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
