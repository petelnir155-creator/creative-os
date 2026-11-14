const STATUS = {
  idle: '',
  dirty: 'ממתין לשמירה...',
  saving: 'שומר...',
  saved: 'נשמר בענן',
  error: 'השמירה נכשלה',
}

export default function BrandBar({ brands, activeId, onSwitch, onNew, onDelete, onSignOut, saveState }) {
  const btn = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-400'
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white" aria-hidden="true">✦</span>
        <h1 className="me-2 text-base font-extrabold">סטודיו יצירתי</h1>

        <label htmlFor="brandSelect" className="sr-only">בחר מותג</label>
        <select
          id="brandSelect" value={activeId ?? ''} onChange={(e) => onSwitch(e.target.value)}
          className="min-w-0 max-w-[55vw] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
        >
          {brands.map((b) => <option key={b.id} value={b.id}>{b.brand_name || 'ללא שם'}</option>)}
        </select>

        <button type="button" onClick={onNew} className={btn}>+ מותג חדש</button>
        <button type="button" onClick={onDelete} className={`${btn} text-red-700`}>מחק</button>
        <button type="button" onClick={onSignOut} className={btn}>יציאה</button>
        <span className="ms-auto text-xs text-slate-500" role="status">{STATUS[saveState]}</span>
      </div>
    </header>
  )
}
