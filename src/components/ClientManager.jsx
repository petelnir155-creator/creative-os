import AutoTextarea from './AutoTextarea'

// The Brand Library form. Field keys match the Supabase columns exactly.
export const BRAND_FIELDS = [
  { key: 'brand_name', label: 'שם המותג', rows: 1, placeholder: 'למשל: חיותא', hint: '' },
  { key: 'tone_of_voice', label: 'טון דיבור', rows: 3, placeholder: 'למשל: ציני, פילוסופי, חד ומודע לעצמו.', hint: 'איך המותג מדבר, ומה הוא אף פעם לא יגיד.' },
  { key: 'main_characters', label: 'דמויות ראשיות', rows: 5, placeholder: 'למשל: מקס, פאג עצבני שמרגיש לא מובן. הארווי, ציניקן שמסביר הכול עם מדע והיסטוריה.', hint: 'כל דמות והאופי שלה.' },
  { key: 'core_insights', label: 'תובנות ליבה', rows: 4, placeholder: 'תובנות שכבר הוכחו כנכונות למותג ולקהל שלו.', hint: '' },
  { key: 'past_scripts', label: 'תסריטים קודמים וסגנון', rows: 6, placeholder: 'הדבק תסריטים קודמים כדי ש-Claude ילמד את הסגנון.', hint: '' },
]

export default function ClientManager({ fields, onChange }) {
  return (
    <div className="flex flex-col gap-3.5">
      {BRAND_FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <label htmlFor={f.key} className="text-sm font-bold">{f.label}</label>
          {f.hint && <p className="-mt-0.5 text-[13px] leading-snug text-slate-500">{f.hint}</p>}
          <AutoTextarea
            id={f.key} minRows={f.rows} value={fields[f.key]} placeholder={f.placeholder}
            onChange={(e) => onChange({ [f.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  )
}
