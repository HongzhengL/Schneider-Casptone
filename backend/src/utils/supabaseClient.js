import { createClient } from '@supabase/supabase-js';
import '../config/environment.js';

const ensureSupabaseConfig = () => {
    const supabaseUrl = process.env.SUPABASE_URL ?? '';
    const supabaseKey = process.env.SUPABASE_KEY ?? '';

    if (!supabaseUrl) {
        throw new Error(
            'Supabase URL is not configured. Set SUPABASE_URL in the environment to enable authentication.'
        );
    }

    if (!supabaseKey) {
        throw new Error(
            'Supabase key is not configured. Set SUPABASE_KEY in the environment to enable authentication.'
        );
    }

    return { supabaseUrl, supabaseKey };
};

const buildClient = () => {
    const { supabaseUrl, supabaseKey } = ensureSupabaseConfig();

    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });
};

let cachedClient = null;

export const createSupabaseClient = () => buildClient();

export const getSupabaseClient = () => {
    if (!cachedClient) {
        cachedClient = buildClient();
    }

    return cachedClient;
};
