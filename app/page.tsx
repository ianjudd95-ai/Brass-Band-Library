export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-slate-800">
          🎺 Brass Band Library
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Secure access to band music and resources.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold">
              Contest Music
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold">
              Concert Music
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold">
              Marches
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold">
              Hymn Tunes
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold">
              Christmas Music
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold">
              Training Music
            </h2>
          </div>
        </div>
      </div>
    </main>
  );
}