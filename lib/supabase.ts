import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dpfpzocjzgimosyrtvls.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnB6b2NqemdpbW9zeXJ0dmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjQ3NzksImV4cCI6MjA4NTMwMDc3OX0.kM7fC_MH5qbT49Ynif2e7JQuUH3ADxuqI1VKtsALhzM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)