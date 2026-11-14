import { useState } from 'react'
import { ACTIONS } from '../lib/constants'
import Markdown from './Markdown'

const fmt = (iso) => new Date(iso).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function OutputPanel({ gens, viewId, onView, busy, error }) {
  const [copied, setCopied] = useState('')
  const current = gens.find((g) => g.id === viewId)

  const copy = async () => {
    try { await navigator.clipboard.writeText(current.output); setCopied('הועתק') }
    catch { setCopied('ההעתקה נחסמה') }
    setTimeout(() => setCopied(''), 1600)
  }

  return (
    <section aria-label="תוצאה" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
        <h2 className="text-base font-extrabold">
          {busy ? `${ACTIONS[busy].em} ${ACTIONS[busy].label}` : current ? `${ACTIONS[current.action].em} ${ACTIONS[current.action].label} · ${fmt(current.created_at)}` : 'התוצאה'}
        </h2>
        <button type="button" onClick={copy} disabled={!current || Boolean(busy)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold hover:bg-slate-50 disabled:opacity-50">
          {copied || 'העתק'}
        </button>
      </div>

      {gens.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 px-4 py-2.5">
          {gens.map((g) => (
            <button key={g.id} type="button" onClick={() => onView(g.id)} aria-current={g.id === viewId && !busy}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] ${g.id === viewId && !busy ? 'border-indigo-200 bg-indigo-50 font-bold text-indigo-900' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
              {ACTIONS[g.action].em} {fmt(g.created_at)}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-80 px-5 pb-7 pt-5" aria-live="polite">
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p>}
        {busy ? (
          <div className="grid min-h-64 place-items-center text-center text-slate-500">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
              <b className="text-xl text-slate-900">חושב על זה...</b>
              <span className="text-sm">זה לוקח בדרך כלל כמה שניות.</span>
            </div>
          </div>
        ) : current ? (
          <Markdown text={current.output} />
        ) : (
          <div className="grid min-h-64 place-items-center text-center text-slate-500">
            <div><b className="mb-1 block text-xl text-slate-900">עוד אין תוצאה</b>מלא את הבריף ולחץ על אחת הפעולות.</div>
          </div>
        )}
      </div>
    </section>
  )
}
