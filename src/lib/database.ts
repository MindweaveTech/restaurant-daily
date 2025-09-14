import { getSupabaseAdmin, supabaseAdmin, Restaurant, User } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';

// Helper to get client with fallback
async function getClient(): Promise<SupabaseClient> {
  try {
    return await getSupabaseAdmin();
  } catch {
    if (!supabaseAdmin) {
      throw new Error('No Supabase client available');
    }
    return supabaseAdmin;
  }
}

// Restaurant operations
export class RestaurantService {

  async createRestaurant(data: {
    name: string;
    address: string;
    phone: string;
    google_maps_link?: string;
    logo_url?: string;
    settings?: Record<string, unknown>;
  }): Promise<Restaurant> {

    const restaurantData = {
      name: data.name.trim(),
      address: data.address.trim(),
      phone: data.phone,
      google_maps_link: data.google_maps_link || null,
      logo_url: data.logo_url || null,
      settings: data.settings || {},
      status: 'active' as const,
    };

    const client = await getClient();
    const { data: restaurant, error } = await client
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating restaurant:', error);
      throw new Error(`Failed to create restaurant: ${error.message}`);
    }

    return restaurant;
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const client = await getClient();
    const { data: restaurant, error } = await client
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Restaurant not found
        return null;
      }
      console.error('Database error fetching restaurant:', error);
      throw new Error(`Failed to fetch restaurant: ${error.message}`);
    }

    return restaurant;
  }

  async getRestaurantByPhone(phone: string): Promise<Restaurant | null> {
    const client = await getClient();
    const { data: restaurant, error } = await client
      .from('restaurants')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Restaurant not found
        return null;
      }
      console.error('Database error fetching restaurant by phone:', error);
      throw new Error(`Failed to fetch restaurant: ${error.message}`);
    }

    return restaurant;
  }

  async updateRestaurant(id: string, updates: Partial<Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>>): Promise<Restaurant> {
    const client = await getClient();
    const { data: restaurant, error } = await client
      .from('restaurants')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating restaurant:', error);
      throw new Error(`Failed to update restaurant: ${error.message}`);
    }

    return restaurant;
  }
}

// User operations
export class UserService {

  async createUser(data: {
    phone: string;
    restaurant_id?: string;
    role: 'admin' | 'staff';
    permissions?: string[];
    status?: 'pending' | 'active' | 'inactive';
    invited_by?: string;
  }): Promise<User> {

    const userData = {
      phone: data.phone,
      restaurant_id: data.restaurant_id || null,
      role: data.role,
      permissions: data.permissions || [],
      status: data.status || 'active',
      invited_by: data.invited_by || null,
      first_login: null,
      last_login: null,
    };

    const client = await getClient();
    const { data: user, error } = await client
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return user;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const client = await getClient();
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null;
      }
      console.error('Database error fetching user:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return user;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    const client = await getClient();
    const { data: user, error } = await client
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return user;
  }

  async updateLastLogin(phone: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('phone', phone);

    if (error) {
      console.error('Database error updating last login:', error);
      // Don't throw error for login tracking failures
    }
  }
}

// Singleton instances
export const restaurantService = new RestaurantService();
export const userService = new UserService();