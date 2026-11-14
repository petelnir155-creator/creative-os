import AutoTextarea from './AutoTextarea'

export default function ReferencesList({ refs, onChange }) {
  const update = (i, patch) => onChange(refs.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  return (
    <div className="flex flex-col gap-3">
      {refs.length === 0 && <p className="text-sm text-slate-500">עוד לא נוספו רפרנסים.</p>}
      {refs.map((r, i) => (
        <div key={i} className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between text-sm">
            <b>רפרנס {i + 1}</b>
            <button type="button" aria-label={`הסר רפרנס ${i + 1}`} onClick={() => onChange(refs.filter((_, j) => j !== i))}
              className="rounded-lg px-2 py-1 text-slate-500 hover:bg-white hover:text-red-700">✕</button>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`rl${i}`} className="text-sm font-bold">לינק לרפרנס</label>
              <AutoTextarea id={`rl${i}`} dir="ltr" className="text-start" value={r.link} placeholder="https://..."
                onChange={(e) => update(i, { link: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`rp${i}`} className="text-sm font-bold">מה מטרת הרפרנס?</label>
              <AutoTextarea id={`rp${i}`} value={r.purpose} placeholder="למשל: רפרנס לסגנון הכתיבה של המותג..."
                onChange={(e) => update(i, { purpose: e.target.value })} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...refs, { link: '', purpose: '' }])}
        className="self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50">
        + הוסף רפרנס
      </button>
    </div>
  )
}
