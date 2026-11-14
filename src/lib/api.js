import { supabase } from './supabase'

// Calls the "generate" Edge Function. The Anthropic key and the system prompt live there, never in the browser.
export async function generate(payload) {
  const { data, error } = await supabase.functions.invoke('generate', { body: payload })

  if (error) {
    let msg = error.message
    try {
      const body = await error.context?.json() // FunctionsHttpError carries the Response
      if (body?.error) msg = body.error
    } catch { /* keep default message */ }
    throw new Error(msg)
  }
  if (data?.error) throw new Error(data.error)
  if (!data?.text) throw new Error('התשובה חזרה ריקה. נסה שוב.')
  return data.text
}
