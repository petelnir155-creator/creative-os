import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import { generate } from './lib/api'
import BrandBar from './components/BrandBar'
import ClientManager, { BRAND_FIELDS } from './components/ClientManager'
import AutoTextarea from './components/AutoTextarea'
import ReferencesList from './components/ReferencesList'
import ActionPanel from './components/ActionPanel'
import OutputPanel from './components/OutputPanel'

const EMPTY = { brand_name: '', tone_of_voice: '', main_characters: '', core_insights: '', past_scripts: '', brief: '', refs: [] }
const card = 'flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'

export default function Workspace() {
  const [brands, setBrands] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [fields, setFields] = useState({ ...EMPTY })
  const [saveState, setSaveState] = useState('idle')
  const [gens, setGens] = useState([])
  const [viewId, setViewId] = useState(null)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  
  // שליטה בטאבים ובתצוגת הספרייה
  const [activeTab, setActiveTab] = useState('studio') 
  const [brandMode, setBrandMode] = useState('list') // 'list' | 'summary' | 'edit'

  const dirty = useRef(false)
  const fieldsRef = useRef(fields)
  fieldsRef.current = fields
  const outRef = useRef(null)

  /* ---- open a brand: fill the form from the cloud copy, load its history ---- */
  const openBrand = useCallback(async (brand) => {
    dirty.current = false
    setSaveState('idle')
    setActiveId(brand.id)
    setFields({
      brand_name: brand.brand_name, tone_of_voice: brand.tone_of_voice, main_characters: brand.main_characters,
      core_insights: brand.core_insights, past_scripts: brand.past_scripts,
      brief: brand.draft?.brief ?? '', refs: brand.draft?.refs ?? [],
    })
    const { data, error: e } = await supabase.from('generations').select('*').eq('brand_id', brand.id).order('created_at', { ascending: false }).limit(30)
    if (e) setError(e.message)
    setGens(data ?? [])
    setViewId(data?.[0]?.id ?? null)
  }, [])

  /* ---- first load ---- */
  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data, error: e } = await supabase.from('brands').select('*').order('updated_at', { ascending: false })
      if (!alive) return
      if (e) return setError(e.message)
      let list = data
      if (!list.length) {
        const { data: created, error: e2 } = await supabase.from('brands').insert({ brand_name: 'לקוח ראשון' }).select().single()
        if (e2) return setError(e2.message)
        list = [created]
      }
      setBrands(list)
      openBrand(list[0])
    })()
    return () => { alive = false }
  }, [openBrand])

  /* ---- autosave ---- */
  const save = useCallback(async () => {
    if (!dirty.current || !activeId) return
    dirty.current = false
    setSaveState('saving')
    const f = fieldsRef.current
    const { data, error: e } = await supabase.from('brands')
      .update({
        brand_name: f.brand_name, tone_of_voice: f.tone_of_voice, main_characters: f.main_characters,
        core_insights: f.core_insights, past_scripts: f.past_scripts,
        draft: { brief: f.brief, refs: f.refs },
      })
      .eq('id', activeId).select().single()
    if (e) { dirty.current = true; setSaveState('error'); return }
    setBrands((bs) => bs.map((b) => (b.id === data.id ? data : b)))
    setSaveState('saved')
  }, [activeId])

  useEffect(() => {
    if (!dirty.current || !activeId) return
    setSaveState('dirty')
    const t = setTimeout(save, 900)
    return () => clearTimeout(t)
  }, [fields, activeId, save])

  const edit = (patch) => { dirty.current = true; setFields((f) => ({ ...f, ...patch })) }

  /* ---- brand library actions ---- */
  const switchBrand = async (id) => {
    await save()
    const b = brands.find((x) => x.id === id)
    if (b) openBrand(b)
  }
  const newBrand = async () => {
    await save()
    const { data, error: e } = await supabase.from('brands').insert({ brand_name: 'לקוח חדש' }).select().single()
    if (e) return setError(e.message)
    setBrands((bs) => [data, ...bs])
    openBrand(data)
  }
  const deleteBrand = async () => {
    if (!window.confirm('למחוק את המותג ואת כל ההיסטוריה שלו?')) return
    dirty.current = false
    const { error: e } = await supabase.from('brands').delete().eq('id', activeId)
    if (e) return setError(e.message)
    const rest = brands.filter((b) => b.id !== activeId)
    if (rest.length) { setBrands(rest); openBrand(rest[0]) }
    else {
      const { data } = await supabase.from('brands').insert({ brand_name: 'לקוח ראשון' }).select().single()
      setBrands([data]); openBrand(data)
    }
  }

  /* ---- the brain: call Claude ---- */
  const run = async (action) => {
    if (busy) return
    const f = fieldsRef.current
    const hasBrand = BRAND_FIELDS.some((x) => x.key !== 'brand_name' && f[x.key].trim())
    if (!f.brief.trim() && !hasBrand) return setError('הוסף לפחות פרטי מותג או בריף.')
    setError('')
    setBusy(action)
    outRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    const refs = f.refs.filter((r) => r.link.trim() || r.purpose.trim())
    const previousOutput = action === 'insights' ? '' : gens.find((g) => g.id === viewId)?.output ?? ''
    try {
      await save()
      const text = await generate({
        action, brief: f.brief, refs, previousOutput,
        brandName: f.brand_name, toneOfVoice: f.tone_of_voice, mainCharacters: f.main_characters,
        coreInsights: f.core_insights, pastScripts: f.past_scripts,
      })
      const { data, error: e } = await supabase.from('generations')
        .insert({ brand_id: activeId, action, brief: f.brief, refs, output: text }).select().single()
      if (e) throw e
      setGens((g) => [data, ...g])
      setViewId(data.id)
    } catch (e) {
      setError(e.message || 'משהו השתבש. נסה שוב.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC]">
      <BrandBar
        brands={brands} activeId={activeId}
        onSwitch={switchBrand} onNew={newBrand} onDelete={deleteBrand}
        onSignOut={() => supabase.auth.signOut()} saveState={saveState}
      />

      {/* תפריט הטאבים */}
      <div className="mx-auto max-w-6xl px-4 pt-6 flex gap-3">
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-5 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'studio'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
          }`}
        >
          רובוט עדי
        </button>
        <button
          onClick={() => {
            setActiveTab('brands')
            setBrandMode('list') // תמיד נכנס קודם לרשימה הכללית
          }}
          className={`px-5 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'brands'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
          }`}
        >
          ספריית מותגים
        </button>
      </div>

      <main className="mx-auto max-w-6xl p-4">
        {activeTab === 'studio' ? (
          /* --- מסך 1: עבודה שוטפת (רובוט עדי) --- */
          <div className="grid gap-4 lg:grid-cols-[5fr_6fr] lg:items-start">
            <div className="flex min-w-0 flex-col gap-3.5">
              <section className={card}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-extrabold"><label htmlFor="brief">הבריף הנוכחי</label></h2>
                  
                  {/* בורר הלקוחות החדש שביקשת בתוך הסטודיו */}
                  <select 
                    value={activeId || ''} 
                    onChange={(e) => switchBrand(e.target.value)}
                    className="bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1 font-medium outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.brand_name || 'לקוח ללא שם'}</option>
                    ))}
                  </select>
                </div>
                
                <p className="-mt-1 text-[13px] leading-snug text-slate-500">האתגר, הנושא המרכזי, המטרה והגבולות עבור {fields.brand_name}.</p>
                <AutoTextarea id="brief" minRows={7} className="min-h-48 mt-2" value={fields.brief}
                  onChange={(e) => edit({ brief: e.target.value })}
                  placeholder="למשל: תסריט ל-30 שניות על ביקורות 5 כוכבים בגוגל. לא ללעוג ללקוחות ולא לערער על האמינות." />
              </section>

              <section className={card}>
                <h2 className="text-base font-extrabold">רפרנסים</h2>
                <p className="-mt-1 text-[13px] leading-snug text-slate-500">לכל רפרנס לינק ומטרה. הלינקים נשלחים כטקסט בלבד.</p>
                <ReferencesList refs={fields.refs} onChange={(refs) => edit({ refs })} />
              </section>

              <section className={card} aria-label="פעולות">
                <h2 className="text-base font-extrabold">מה עושים עם זה?</h2>
                <ActionPanel busy={busy} onRun={run} />
              </section>
            </div>

            <div ref={outRef} className="min-w-0 scroll-mt-20 lg:sticky lg:top-20">
              <OutputPanel gens={gens} viewId={viewId} onView={setViewId} busy={busy} error={error} />
            </div>
          </div>
        ) : (
          /* --- מסך 2: ספריית מותגים מורחבת --- */
          <div className="mx-auto max-w-4xl flex min-w-0 flex-col gap-3.5 mt-2">
            
            {/* מצב 1: רשימת הלקוחות (תיקיות) */}
            {brandMode === 'list' && (
              <div className={`${card} p-8`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-extrabold text-slate-800">תיקי לקוחות</h2>
                  <button
                    onClick={async () => {
                      await newBrand();
                      setBrandMode('edit');
                    }}
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200 transition"
                  >
                    + לקוח חדש
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {brands.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        switchBrand(b.id);
                        setBrandMode('summary');
                      }}
                      className="border border-slate-200 rounded-xl p-6 cursor-pointer hover:border-purple-400 hover:shadow-md transition-all bg-slate-50 hover:bg-white text-center group"
                    >
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📁</div>
                      <h3 className="text-lg font-bold text-slate-800">{b.brand_name || 'ללא שם'}</h3>
                      <p className="text-sm text-slate-500 mt-1">צפה ב-DNA</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* מצב 2: תצוגת תקציר לקוח (קריאה בלבד) */}
            {brandMode === 'summary' && (
              <div className={`${card} p-8`}>
                <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-4">
                  <div>
                    <button onClick={() => setBrandMode('list')} className="text-slate-400 hover:text-purple-600 text-sm font-medium mb-3 flex items-center gap-1 transition">
                      ← חזור לרשימת הלקוחות
                    </button>
                    <h2 className="text-3xl font-extrabold text-slate-800">{fields.brand_name}</h2>
                  </div>
                  <button onClick={() => setBrandMode('edit')} className="border border-slate-200 text-slate-700 px-5 py-2 rounded-lg font-bold hover:bg-slate-50 transition shadow-sm">
                    ✏️ ערוך DNA
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">טון דיבור</h4>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap text-[15px] leading-relaxed border border-slate-100">{fields.tone_of_voice || 'עדיין לא הוגדר טון דיבור.'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">דמויות ראשיות</h4>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap text-[15px] leading-relaxed border border-slate-100">{fields.main_characters || 'עדיין לא הוגדרו דמויות.'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">תובנות ליבה</h4>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap text-[15px] leading-relaxed border border-slate-100">{fields.core_insights || 'עדיין לא הוגדרו תובנות.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* מצב 3: עריכת DNA */}
            {brandMode === 'edit' && (
              <section className={`${card} p-6 sm:p-8 border-purple-200 shadow-md ring-1 ring-purple-50`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-extrabold text-slate-800">
                    עריכת {fields.brand_name || 'מותג'}
                  </h2>
                  <button onClick={() => setBrandMode('summary')} className="bg-purple-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-purple-700 transition shadow-sm">
                    ✓ סיום עריכה
                  </button>
                </div>
                <ClientManager fields={fields} onChange={edit} />
              </section>
            )}
            
          </div>
        )}
      </main>
    </div>
  )
}
