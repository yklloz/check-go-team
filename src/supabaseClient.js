import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://beiiwykdmvqoovbetjnl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlaWl3eWtkbXZxb292YmV0am5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTI2ODgsImV4cCI6MjA5MDA2ODY4OH0.Akl86mHCFrfaJ1gej91s9Oxh4dJ3Ab6yryITu7umj9g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)