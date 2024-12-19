import { supabase } from './supabase';
import { UserRole, UserPermissions } from '../types';

export function getDefaultPermissions(role: UserRole): UserPermissions {
  switch (role) {
    case 'admin':
      return {
        viewDashboard: true,
        viewSpreadsheet: true,
        manageStores: true,
        manageUsers: true,
        processOrders: true
      };
    case 'manager':
      return {
        viewDashboard: true,
        viewSpreadsheet: true,
        manageStores: true,
        manageUsers: true,
        processOrders: true
      };
    case 'employee':
      return {
        viewDashboard: true,
        viewSpreadsheet: false,
        manageStores: false,
        manageUsers: false,
        processOrders: true
      };
  }
}

export async function createAdminStore() {
  // Check if admin store exists
  const { data: existingStore } = await supabase
    .from('stores')
    .select()
    .eq('code', 'ADMIN')
    .single();

  if (existingStore) {
    return existingStore;
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert({
      name: 'Admin Store',
      code: 'ADMIN'
    })
    .select()
    .single();

  if (storeError) throw storeError;

  return store;
}

export async function setupAdminUser() {
  try {
    // Create admin store first
    const adminStore = await createAdminStore();
    
    // Try to sign in first
    const { data: { user: existingUser }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'digitalmarketinghelpers@gmail.com',
      password: 'S3ssi0n!'
    });

    if (!signInError && existingUser) {
      return existingUser;
    } else {
      // If login fails, try to create the user
      const { data: { user: newUser }, error } = await supabase.auth.signUp({
        email: 'digitalmarketinghelpers@gmail.com',
        password: 'S3ssi0n!',
        options: {
          data: { role: 'admin' }
        }
      });

      if (error) throw error;
      if (!newUser) throw new Error('Failed to create admin user');

      // Create admin profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: newUser.id,
          email: newUser.email!,
          role: 'admin',
          permissions: getDefaultPermissions('admin'),
          store_ids: [adminStore.id],
          managed_stores: [adminStore.id]
        }]).select().single();

      if (profileError) throw profileError;
      return newUser;
    }

  } catch (error) {
    console.error('Error setting up admin user:', error);
    throw error;
  }
}