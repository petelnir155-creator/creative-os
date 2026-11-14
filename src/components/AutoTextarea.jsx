import { useLayoutEffect, useRef } from 'react'

// A textarea that grows with its content, so text and placeholders are never cut off
export default function AutoTextarea({ value, onChange, minRows = 2, className = '', ...rest }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`
  }, [value])

  return (
    <textarea
      ref={ref} rows={minRows} value={value} onChange={onChange}
      className={`w-full resize-none overflow-hidden rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base leading-relaxed outline-none [overflow-wrap:anywhere] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 ${className}`}
      {...rest}
    />
  )
}
