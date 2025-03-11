
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ftnxwoglqicbzlfvmcrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bnh3b2dscWljYnpsZnZtY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MTUzOTMsImV4cCI6MjA1Njk5MTM5M30.dtTzQazP87onx3RVcL77ArG-xN9Ulwbj_uvs81vv0mo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
