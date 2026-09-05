/*
 * Filename: js/core/supabaseClient.js
 * Version: 2.1.0 (Stable Fix)
 * Description: Initializes Supabase using the Global Window Object.
 */

import { SUPABASE_CONFIG } from '../config/supabase.js';

if (!window.supabase) {
    console.error("CRITICAL: Supabase script not loaded in index.html");
}

const createClient = window.supabase?.createClient;

export const supabase = createClient 
    ? createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.KEY) 
    : null;
