import { getSupabaseAdmin, supabaseAdmin, Restaurant, User, StaffInvitation, SystemAdmin, BusinessInvitation } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

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

// System Admin operations (for superadmins)
export class SystemAdminService {
  async getByEmail(email: string): Promise<SystemAdmin | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('system_admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Database error fetching system admin by email:', error);
      throw new Error(`Failed to fetch system admin: ${error.message}`);
    }
    return data;
  }

  async getByPhone(phone: string): Promise<SystemAdmin | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('system_admins')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Database error fetching system admin by phone:', error);
      throw new Error(`Failed to fetch system admin: ${error.message}`);
    }
    return data;
  }

  async updateLastLogin(id: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('system_admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Database error updating system admin last login:', error);
    }
  }
}

// Business Invitation operations (for inviting business admins)
export class BusinessInvitationService {
  async createInvitation(data: {
    invited_by: string;
    phone: string;
    restaurant_name: string;
    email?: string;
  }): Promise<BusinessInvitation> {
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitationData = {
      invited_by: data.invited_by,
      phone: data.phone,
      email: data.email || null,
      restaurant_name: data.restaurant_name,
      role: 'business_admin' as const,
      status: 'pending' as const,
      invitation_token: invitationToken,
      expires_at: expiresAt.toISOString(),
    };

    const client = await getClient();
    const { data: invitation, error } = await client
      .from('business_invitations')
      .insert([invitationData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating business invitation:', error);
      throw new Error(`Failed to create business invitation: ${error.message}`);
    }
    return invitation;
  }

  async getByToken(token: string): Promise<BusinessInvitation | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('business_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Database error fetching business invitation:', error);
      throw new Error(`Failed to fetch business invitation: ${error.message}`);
    }
    return data;
  }

  async markAccepted(id: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('business_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Database error accepting business invitation:', error);
      throw new Error(`Failed to accept business invitation: ${error.message}`);
    }
  }

  async getAllPending(): Promise<BusinessInvitation[]> {
    const client = await getClient();
    const { data, error } = await client
      .from('business_invitations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching pending business invitations:', error);
      throw new Error(`Failed to fetch business invitations: ${error.message}`);
    }
    return data || [];
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
    email?: string;
    name?: string;
    restaurant_id?: string | null;
    role: UserRole;
    permissions?: string[];
    status?: 'pending' | 'active' | 'inactive';
    invited_by?: string;
  }): Promise<User> {

    const userData = {
      phone: data.phone,
      email: data.email || null,
      name: data.name || null,
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

// Staff invitation operations
export class StaffInvitationService {

  async createInvitation(data: {
    restaurant_id: string;
    phone: string;
    invited_by: string;
    role?: 'staff';
    permissions?: string[];
  }): Promise<StaffInvitation> {

    // Generate secure invitation token
    const invitationToken = crypto.randomUUID();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitationData = {
      restaurant_id: data.restaurant_id,
      phone: data.phone,
      invited_by: data.invited_by,
      role: data.role || 'staff' as const,
      permissions: data.permissions || [],
      status: 'pending' as const,
      invitation_token: invitationToken,
      expires_at: expiresAt.toISOString(),
    };

    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .insert([invitationData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating staff invitation:', error);
      throw new Error(`Failed to create staff invitation: ${error.message}`);
    }

    return invitation;
  }

  async getInvitationByToken(token: string): Promise<StaffInvitation | null> {
    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Invitation not found
        return null;
      }
      console.error('Database error fetching invitation:', error);
      throw new Error(`Failed to fetch invitation: ${error.message}`);
    }

    return invitation;
  }

  // Alias for getInvitationByToken for consistency with other services
  async getByToken(token: string): Promise<StaffInvitation | null> {
    return this.getInvitationByToken(token);
  }

  async markAccepted(id: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('staff_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Database error marking staff invitation accepted:', error);
      throw new Error(`Failed to accept staff invitation: ${error.message}`);
    }
  }

  async getRestaurantInvitations(restaurant_id: string): Promise<StaffInvitation[]> {
    const client = await getClient();
    const { data: invitations, error } = await client
      .from('staff_invitations')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching restaurant invitations:', error);
      throw new Error(`Failed to fetch invitations: ${error.message}`);
    }

    return invitations || [];
  }

  async acceptInvitation(invitationId: string): Promise<StaffInvitation> {
    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Database error accepting invitation:', error);
      throw new Error(`Failed to accept invitation: ${error.message}`);
    }

    return invitation;
  }

  async cancelInvitation(invitationId: string): Promise<StaffInvitation> {
    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Database error cancelling invitation:', error);
      throw new Error(`Failed to cancel invitation: ${error.message}`);
    }

    return invitation;
  }

  async expireOldInvitations(): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('staff_invitations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Database error expiring old invitations:', error);
      // Don't throw error for cleanup operations
    }
  }

  async checkExistingInvitation(restaurant_id: string, phone: string): Promise<StaffInvitation | null> {
    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .eq('phone', phone)
      .eq('status', 'pending')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No existing invitation
        return null;
      }
      console.error('Database error checking existing invitation:', error);
      throw new Error(`Failed to check existing invitation: ${error.message}`);
    }

    return invitation;
  }
}

// Singleton instances
export const systemAdminService = new SystemAdminService();
export const businessInvitationService = new BusinessInvitationService();
export const restaurantService = new RestaurantService();
export const userService = new UserService();
export const staffInvitationService = new StaffInvitationService();