# סטודיו יצירתי: הגדרה

הארכיטקטורה: דפדפן (React) ← Supabase (התחברות + מסד נתונים) ← פונקציית שרת `generate` ← Claude.
מפתח Anthropic נמצא רק כסוד בשרת. המותגים וההיסטוריה נשמרים בענן ולכן מופיעים בכל מכשיר.

## 1. פרויקט Supabase
צור פרויקט חינמי ב-supabase.com. ב-Project Settings → API העתק את ה-URL ואת ה-anon key.

## 2. טבלאות
ב-SQL Editor הרץ את כל התוכן של `supabase/migrations/0001_init.sql`.

## 3. התחברות
ב-Authentication → URL Configuration: הגדר Site URL ל-`http://localhost:5173`, והוסף ל-Redirect URLs גם את כתובת האתר הסופית.

## 4. הפונקציה והמפתח
```bash
npm i -g supabase   # או: brew install supabase/tap/supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy generate
```
השתמש במפתח חדש. מפתח שהודבק בשיחה צריך להיחשב חשוף.

## 5. הפעלה מקומית
```bash
cp .env.example .env     # מלא את שני הערכים
npm install
npm run dev
```

## 6. פריסה
העלה ל-Vercel או Netlify עם שני משתני ה-VITE. הוסף את הכתובת ל-Redirect URLs ב-Supabase.
אחרי שנכנסת בפעם הראשונה: Authentication → Providers → Email → כבה "Allow new users to sign up", כך שרק אתה יכול להיכנס.
