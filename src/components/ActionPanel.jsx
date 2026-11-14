import { ACTIONS } from '../lib/constants'

export default function ActionPanel({ busy, onRun }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {Object.entries(ACTIONS).map(([key, a]) => (
        <button
          key={key} type="button" disabled={Boolean(busy)} onClick={() => onRun(key)} aria-busy={busy === key}
          className={`flex min-h-[88px] flex-col items-start gap-2 rounded-2xl border border-slate-200 p-3.5 text-start text-[15px] font-bold leading-snug transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 ${a.tint} ${busy === key ? 'ring-2 ring-indigo-400' : 'hover:shadow-md'}`}
        >
          <span className="text-2xl leading-none" aria-hidden="true">{a.em}</span>
          {a.label}
        </button>
      ))}
    </div>
  )
}
