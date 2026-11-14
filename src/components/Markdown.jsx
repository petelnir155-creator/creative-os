// Light markdown for model output, rendered as React elements (no raw HTML injection).
// "## " title, "### " insight title, "#### " scene heading, "@NAME (paren)" + next line = dialogue,
// "- " / "1. " lists, **bold**, *italic*, --- rule.

function Inline({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
  return parts.map((p, i) => {
    if (p.length > 4 && p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.length > 2 && p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>
    return p
  })
}

export default function Markdown({ text }) {
  const blocks = String(text).replace(/\r/g, '').split(/\n{2,}/).map((b) => b.replace(/^\n+|\n+$/g, '')).filter(Boolean)

  return (
    <div className="text-[17px] leading-[1.8]">
      {blocks.map((b, i) => {
        const lines = b.split('\n')
        const first = lines[0]
        const h = lines.length === 1 && first.match(/^(#{1,4})\s+(.*)$/)
        if (h) {
          const lv = h[1].length
          if (lv === 1) return <h2 key={i} className="mb-3 text-2xl font-extrabold"><Inline text={h[2]} /></h2>
          if (lv === 2) return <h3 key={i} className="mb-2 mt-6 text-xl font-extrabold"><Inline text={h[2]} /></h3>
          if (lv === 3) return <h4 key={i} className="mb-1 mt-6 text-xl font-extrabold leading-snug text-indigo-900"><Inline text={h[2]} /></h4>
          return <p key={i} className="mb-2 mt-6 border-b border-slate-200 pb-1 text-[15px] font-extrabold tracking-wide"><Inline text={h[2]} /></p>
        }
        if (/^---+$/.test(b)) return <hr key={i} className="my-5 border-slate-200" />
        if (first.startsWith('@')) {
          const m = first.slice(1).trim().match(/^(.*?)\s*(\([^)]*\))?$/)
          return (
            <div key={i} className="mx-auto mb-3 mt-4 max-w-[88%]">
              <b className="block text-center text-[15px] font-extrabold"><Inline text={m[1]} /></b>
              {m[2] && <span className="block text-center text-sm italic text-slate-500">{m[2]}</span>}
              <p><Inline text={lines.slice(1).join(' ')} /></p>
            </div>
          )
        }
        if (lines.every((l) => /^[-•]\s+/.test(l)))
          return <ul key={i} className="mb-3 list-disc ps-6">{lines.map((l, j) => <li key={j} className="mb-1.5"><Inline text={l.replace(/^[-•]\s+/, '')} /></li>)}</ul>
        if (lines.every((l) => /^\d+[.)]\s+/.test(l)))
          return <ol key={i} className="mb-3 list-decimal ps-6">{lines.map((l, j) => <li key={j} className="mb-1.5"><Inline text={l.replace(/^\d+[.)]\s+/, '')} /></li>)}</ol>
        return <p key={i} className="mb-3">{lines.map((l, j) => <span key={j}>{j > 0 && <br />}<Inline text={l} /></span>)}</p>
      })}
    </div>
  )
}
