import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleDatabaseError = (error: PostgrestError) => {
  // Ignore "already exists" errors as they're not actual problems
  if (error.code === '42P07' || error.code === '42710' || error.code === '42P16' || error.code === '42P01' || error.code === '23505') {
    return;
  }
  throw error;
};

export async function setupDatabase() {
  try {
    // Retry logic for database setup
    let retries = 3;
    while (retries > 0) {
      try {
        // Create extension (ignore errors as it may already exist)
        await supabase.rpc('create_extension', { 
          extension_name: 'uuid-ossp' 
        }).catch(() => {});
        
        // Create tables
        const { error: storesError } = await supabase.rpc('create_stores_table');
        if (storesError) handleDatabaseError(storesError);
        
        const { error: profilesError } = await supabase.rpc('create_profiles_table');
        if (profilesError) handleDatabaseError(profilesError);
        
        // Wait a bit before enabling RLS and policies
        await delay(500);
        
        const { error: rlsError } = await supabase.rpc('enable_rls');
        if (rlsError) handleDatabaseError(rlsError);
        
        const { error: policiesError } = await supabase.rpc('create_rls_policies');
        if (policiesError) handleDatabaseError(policiesError);
        
        return true;

      } catch (err) {
        const error = err as PostgrestError;
        if (error.code === '42P07' || error.code === '42710' || error.code === '42P16' || error.code === '42P01' || error.code === '23505') {
          return true;
        }
        
        retries--;
        if (retries > 0) {
          await delay(1000); // Wait before retry
          continue;
        }
        if (retries === 0) {
          console.error('Database setup failed after all retries:', err);
          return false;
        }
        
        // Wait before retrying
        await delay(1000);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    return false;
  }
}