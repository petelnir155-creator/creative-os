// Supabase Edge Function (Deno). Holds the Anthropic key and the system prompt; the browser never sees either.
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const SYSTEM_PROMPT = `אתה קופירייטר וקריאייטיב דיירקטור בכיר, חד לשון ומוסמך, שפרס על שמו פרסים, וגם צופה התנהגותי. אתה שותף יצירתי, לא עוזר.

המשימה שלך: למצוא את "האמת האנושית הלא-אמורה".

כללים:
1. חפש חיכוך: סתירות, התנהגויות קטנוניות, הפער בין מה שאנשים אומרים למה שהם עושים.
2. הימנע מהמובן מאליו. חפש מיקרו-רגעים מהחיים היומיומיים בישראל.
3. אפס שפת שיווק. אסור: "העצמה", "חווית משתמש חלקה", "חדשני", "נוחות", "שדרוג", "מהפכני", "פתרון", ודומיהם בעברית ובאנגלית.
4. חשוב כמו סטנד-אפיסט: פרמיסה עם מתח, לא סלוגן.
5. כלל קריטי, מהי תובנה: תובנה היא לא פרמיסה, לא סיטואציה מצחיקה ולא תיאור סצנה. תובנה היא האמת הפסיכולוגית הגולמית שמאחורי ההתנהגות. תסביר למה בני אדם מתנהגים ככה: איזה חוסר ביטחון, טריפ אגו או הונאה עצמית מסתתרים מתחת. עיקרון זה הוא לתובנות, ולא מחליף את מבנה הסטנד-אפ בתסריט ובפאנצ'ים.
6. תצפית מול תובנה (דוגמאות):
- רע (תצפית בלבד): "בנות מעלות הרבה סטוריז ביום ההולדת של חברה" או "אנשים שוכרים רכב כדי לנסוע מחוץ לעיר". זה משעמם, צפוי וחסר עומק פסיכולוגי.
- טוב 1 (מיקרו-התנהגות לא רציונלית): "כשנשאר לי מעט חלב לקפה, אני שופך אותו הרבה יותר לאט, כאילו שפיכה איטית תשנה את חוקי הפיזיקה ותגדיל את כמות החלב." זו התנהגות לא רציונלית, תחושת שליטה מזויפת ורגע קטן שכולם מכירים.
- טוב 2 (שבירת ברירת המחדל המנטלית): "אנגליה לא חייבת להיגמר בלונדון." (תובנה לחברת השכרת רכב: תיירים כולאים את עצמם ברדיוס בטוח ומוכר מתוך עצלות או התנהגות עדר. השכרת רכב משחררת אותם מהכלא המנטלי הזה.)
התובנות שלך חייבות להתאים לעומק ולחשיבה הצידית של הדוגמאות הטובות.
7. כתוב בעברית טבעית ושיחתית, כמו שמדברים. בלי משלב גבוה ובלי תרגום מאנגלית.

כבד במדויק את טון הדיבור והדמויות של המותג, ואת סגנון התסריטים הקודמים (ללמוד סגנון, לא להעתיק). תובנות הליבה הן נקודת מוצא, לא תחליף לתובנות חדשות. אל תמציא דמויות חדשות ואל תשנה את האופי שלהן.
כבד את גבולות הבריף (למשל: מה אסור ללעוג לו, ומה הזווית). אם הבריף אוסר משהו, זה אסור.
החזר טקסט בלבד, בפורמט הבא: "### " לכותרת תובנה, "#### " לכותרת סצנה, "@שם (הערת משחק)" ובשורה הבאה הדיאלוג, "- " לרשימות, **הדגשה** במשורה.`

const TASKS: Record<string, string> = {
  insights: 'תן בדיוק 5 תובנות, מדויקות פסיכולוגית, בנוסח שאפשר להפוך לפרמיסה של סטנד-אפ. לכל תובנה: "### N. כותרת קצרה וחדה" ואחריה פסקה של משפט או שניים: האמת האנושית, ובעיקר ה"למה": חוסר הביטחון, האגו או ההונאה העצמית שמסתתרים מתחת להתנהגות. לא תיאור של סיטואציה מצחיקה. בלי הקדמה ובלי סיכום.',
  script: 'כתוב תסריט של 30 שניות (בערך 70 עד 90 מילים מדוברות). פתח ב"#### " עם כותרת הסצנה, אחריה פסקאות פעולה קצרות, ואז דיאלוג בפורמט "@שם (הערת משחק)" ובשורה הבאה הטקסט. השתמש בדמויות הראשיות בלבד.',
  punch: 'תן 8 עד 10 פאנצ\'ים חדים, כל אחד שורה אחת ברשימה. אחריהם 3 חילופי דברים קצרים בין הדמויות בפורמט "@שם (הערת משחק)" ובשורה הבאה הטקסט.',
  push: 'קח את התוצר הקודם יותר רחוק: יותר אבסורדי, יותר חד, יותר מפתיע, תוך שמירה על אותו טון, אותן דמויות ואותם גבולות. תן גרסה חדשה בפורמט של התוצר הקודם, לא הערות עליו.',
}

const cap = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  // Only a signed-in user may spend tokens
  const auth = req.headers.get('Authorization') ?? ''
  const supa = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
  })
  const { data: { user } } = await supa.auth.getUser()
  if (!user) return json({ error: 'צריך להתחבר מחדש.' }, 401)

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return json({ error: 'בקשה לא תקינה.' }, 400) }

  const action = String(body.action ?? '')
  if (!(action in TASKS)) return json({ error: 'פעולה לא מוכרת.' }, 400)

  const refs = Array.isArray(body.refs) ? body.refs.slice(0, 20) : []
  const refsText = refs
    .map((r: any) => `- ${cap(r?.link, 500)} — ${cap(r?.purpose, 500)}`)
    .join('\n')
  const previous = cap(body.previousOutput, 12000)

  const userMessage = [
    `<brand_name>${cap(body.brandName, 200)}</brand_name>`,
    `<tone_of_voice>\n${cap(body.toneOfVoice, 4000)}\n</tone_of_voice>`,
    `<main_characters>\n${cap(body.mainCharacters, 6000)}\n</main_characters>`,
    `<core_insights>\n${cap(body.coreInsights, 6000)}\n</core_insights>`,
    `<past_scripts note="לימוד סגנון בלבד, לא להעתיק">\n${cap(body.pastScripts, 12000)}\n</past_scripts>`,
    `<current_brief>\n${cap(body.brief, 8000)}\n</current_brief>`,
    refsText && `<references note="הלינקים הם טקסט בלבד, לא נפתחו">\n${refsText}\n</references>`,
    previous && `<previous_output>\n${previous}\n</previous_output>`,
    `<task>\n${TASKS[action]}\n</task>`,
  ].filter(Boolean).join('\n\n')

  const key = Deno.env.get('ANTHROPIC_API_KEY')
  if (!key) return json({ error: 'מפתח Anthropic לא הוגדר בשרת.' }, 500)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-5-5',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return json({ error: `שגיאה מ-Claude: ${data?.error?.message ?? res.status}` }, 502)

  const text = (data.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim()
  return json({ text })
})
