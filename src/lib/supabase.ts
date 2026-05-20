import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Database features will be disabled.');

  // Minimal safe mock that supports the chained API used in src/lib/posts.ts
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

export { supabase };
