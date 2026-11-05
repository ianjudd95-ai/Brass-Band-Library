# 🎺 Brass Band Library

A private web library of band music. Members sign in and can browse, search, view and download
sheet music stored in a Google Drive folder. Music is managed directly in Google Drive; the site is read-only.

Built with Next.js 16 (App Router, Cache Components), Firebase Authentication and the Google Drive API.

## How it works

- **Sign-in**: Firebase email/password. After signing in, the browser sends its Firebase ID token to
  `/api/session`, which verifies it and stores it in an httpOnly `__session` cookie. `components/AuthSync.tsx`
  refreshes the cookie whenever Firebase refreshes the token (hourly).
- **Protection**: `proxy.ts` redirects signed-out visitors to `/login` (and returns 401 for API calls).
  Every page and the file route also verify the session on the server (`lib/auth.ts`).
- **Drive access**: `lib/googleDrive.ts` uses a read-only service account. Any id requested by a user is
  checked to be inside `GOOGLE_DRIVE_FOLDER_ID` (by walking its parent folders), so nothing else the
  service account can see is reachable. Listings are cached for a few minutes.
- **Files**: `/api/file/[id]` streams files through the server, so Drive files stay private.
  PDFs, images and audio preview inline; other types download. Google Docs are exported as PDF.

| Route | Purpose |
| --- | --- |
| `/library` | Top-level folders, plus search across the whole library (`?q=`) |
| `/library/[id]` | A folder's contents, with breadcrumbs |
| `/file/[id]` | Preview + download for one file |
| `/login` | Sign in / password reset |

## Setup

1. **Firebase**: create a project, enable **Email/Password** sign-in, then in
   *Authentication → Settings → User actions* **untick "Enable create (sign-up)"** so only accounts you
   create in the console can sign in. Add your production domain under *Authorized domains*.
2. **Google Drive**: create a Google Cloud service account (no roles needed), enable the Drive API,
   create a JSON key, and share the library folder with the service account's email as **Viewer**.
3. **Environment**: create `.env.local` (and the same variables in Vercel → Project → Settings → Environment Variables):

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=

   GOOGLE_SERVICE_ACCOUNT_EMAIL=   # client_email from the JSON key
   GOOGLE_PRIVATE_KEY=             # private_key from the JSON key, in double quotes, with \n escapes
   GOOGLE_DRIVE_FOLDER_ID=         # id from the library folder's Drive URL
   ```

4. `npm install`, then `npm run dev` and open http://localhost:3000.

## Managing members

Add, disable or remove members in the Firebase console under *Authentication → Users*. New members can
use **Forgot password?** on the login page to set their own password. A disabled user is locked out
within an hour (when their current token expires).

## Deploying (Vercel)

Import the repo in Vercel, add the environment variables above, and deploy. Then add the Vercel domain to
Firebase's *Authorized domains*.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint`
