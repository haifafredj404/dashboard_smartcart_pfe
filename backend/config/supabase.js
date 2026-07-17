const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dspjfohuyhvcseukdwcy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcGpmb2h1eWh2Y3NldWtkd2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4Nzk5NjUsImV4cCI6MjA4ODQ1NTk2NX0._5ZITyqAxxST7LSkB4WpULrfzMkmLJhZD0MWLFkzFkI'

const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

module.exports = supabase