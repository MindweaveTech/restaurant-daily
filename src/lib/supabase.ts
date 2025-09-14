import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { secretsManager } from './secrets';

// Initialize clients lazily to allow async config loading
let supabaseAdminInstance: SupabaseClient | null = null;
let supabaseInstance: SupabaseClient | null = null;

// Server-side client with service role key (for API routes)
export const getSupabaseAdmin = async () => {
  if (!supabaseAdminInstance) {
    const config = await secretsManager.getSupabaseConfig();

    if (!config.url || !config.serviceKey) {
      throw new Error('Missing Supabase configuration. Check Vault or environment variables.');
    }

    supabaseAdminInstance = createClient(config.url, config.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminInstance;
};

// Client-side client with anon key (for frontend)
export const getSupabase = async () => {
  if (!supabaseInstance) {
    const config = await secretsManager.getSupabaseConfig();

    if (!config.url || !config.anonKey) {
      throw new Error('Missing Supabase configuration. Check Vault or environment variables.');
    }

    supabaseInstance = createClient(config.url, config.anonKey);
  }
  return supabaseInstance;
};

// Legacy exports for immediate use (will try environment first)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseAdmin: SupabaseClient | null = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  google_maps_link?: string;
  phone: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  phone: string;
  restaurant_id?: string;
  role: 'admin' | 'staff';
  permissions?: string[];
  status: 'pending' | 'active' | 'inactive';
  invited_by?: string;
  first_login?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffInvitation {
  id: string;
  restaurant_id: string;
  phone: string;
  invited_by: string;
  role: 'staff';
  permissions?: string[];
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitation_token?: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}