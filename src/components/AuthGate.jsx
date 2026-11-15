import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthGate() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setState('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) { setState('error'); setMessage(error.message) } else setState('sent')
  }

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-extrabold">רובוט עדי</h1>
        {state === 'sent' ? (
          <p className="text-sm leading-relaxed text-slate-600">
            שלחתי קישור כניסה ל־<b dir="ltr">{email}</b>. פתח אותו באותו מכשיר שבו אתה רוצה להיכנס.
          </p>
        ) : (
          <>
            <label htmlFor="email" className="text-sm font-bold">אימייל</label>
            <input
              id="email" type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-slate-200 px-3.5 py-3 text-start text-base outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="you@example.com" autoComplete="email"
            />
            <button
              type="submit" disabled={state === 'sending'}
              className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-3 text-base font-bold text-white disabled:opacity-60"
            >
              {state === 'sending' ? 'שולח...' : 'שלח לי קישור כניסה'}
            </button>
            {state === 'error' && <p role="alert" className="text-sm text-red-700">{message}</p>}
          </>
        )}
      </form>
    </div>
  )
}
