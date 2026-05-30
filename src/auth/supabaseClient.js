import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://beiiwykdmvqoovbetjnl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_OoOIxoKwqoDwmScpWKRKiA_r9Gzbmsx'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
