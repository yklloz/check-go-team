import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://beiiwykdmvqoovbetjnl.supabase.co'
const supabaseAnonKey = 'sb_publishable_OoOIxoKwqoDwmScpWKRKiA_r9Gzbmsx'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)