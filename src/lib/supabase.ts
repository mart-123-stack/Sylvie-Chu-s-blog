import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: any;
let supabaseAdmin: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Database features will be disabled.');

  const mockChain: any = {
    select() { return this; },
    order() { return Promise.resolve({ data: [], error: null }); },
    eq() { return this; },
    neq() { return this; },
    single() { return Promise.resolve({ data: null, error: null }); },
    insert() { return this; },
    update() { return this; },
    delete() { return this; },
  };

  supabase = {
    from() { return mockChain; },
  } as any;

} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Admin client for server-side writes (bypasses RLS)
if (supabaseUrl && serviceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
}

export { supabase, supabaseAdmin };
