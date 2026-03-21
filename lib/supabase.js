import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SUPABASE_URL = 'https://wkogyqihtjaqrfmyujoj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_w0qqHqok7yFpd0GvjwAsFg_GQ8bAMeG'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
