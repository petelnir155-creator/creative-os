import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthGate() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg('שגיאה בהתחברות: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <div className="text-center mb-6">
          <img src="/adi.png" alt="רובוט עדי" className="w-16 h-16 rounded-2xl mx-auto mb-3 object-cover shadow-md" />
          <h1 className="text-2xl font-bold text-slate-800">רובוט עדי</h1>
          <p className="text-sm text-slate-500 mt-1">התחבר למערכת הקריאייטיב</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-right">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-right">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'מתחבר...' : 'התחבר למערכת'}
          </button>
        </form>
      </div>
    </div>
  )
}
