import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://miiaqlxiqhvzrsbvrgnp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paWFxbHhpcWh2enJzYnZyZ25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4ODg2MDQsImV4cCI6MjA3NTQ2NDYwNH0.PMNZuUEILGEPNIk2yY2yZ02sinUTCuBjIZiunwbylk8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
