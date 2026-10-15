"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!currentUser) {
          router.push("/login");
        } else {
          setUser(currentUser);
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-4xl font-bold">
        🎺 Brass Band Library
      </h1>

      {user && (
        <>
          <p className="mt-2 text-slate-600">
            Logged in as: {user.email}
          </p>

          <button
            onClick={() => signOut(auth)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </>
      )}

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white p-6 rounded-xl shadow">
          📁 Contest Music
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          🎵 Concert Music
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          🥁 Marches
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          🎄 Christmas Music
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          🙏 Hymn Tunes
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          📚 Training Music
        </div>
      </div>
    </main>
  );
}