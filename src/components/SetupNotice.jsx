export default function SetupNotice() {
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-xl font-extrabold">חסרה הגדרה של Supabase</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          העתק את <code dir="ltr">.env.example</code> לקובץ בשם <code dir="ltr">.env</code>, מלא בו את{' '}
          <code dir="ltr">VITE_SUPABASE_URL</code> ואת <code dir="ltr">VITE_SUPABASE_ANON_KEY</code>, והפעל מחדש את{' '}
          <code dir="ltr">npm run dev</code>.
        </p>
      </div>
    </div>
  )
}
