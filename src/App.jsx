import { configured } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import SetupNotice from './components/SetupNotice'
import AuthGate from './components/AuthGate'
import Workspace from './Workspace'

export default function App() {
  const { session, loading } = useAuth()
  if (!configured) return <SetupNotice />
  if (loading) return <div className="grid min-h-dvh place-items-center text-slate-500">טוען...</div>
  if (!session) return <AuthGate />
  return <Workspace key={session.user.id} />
}
