import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile, UserRole, UserPermissions } from '../types';
import { setupDatabase } from '../lib/database/setup';

const getDefaultPermissions = (role: UserRole): UserPermissions => ({
  viewDashboard: true,
  viewSpreadsheet: role !== 'employee',
  manageStores: role === 'admin' || role === 'manager',
  manageUsers: role === 'admin' || role === 'manager',
  processOrders: true
});

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  canAccessStore: (storeId: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  hasPermission: () => false,
  canAccessStore: () => false,
} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      await setupDatabase();

      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        const { data: userData } = await supabase.auth.getUser(userId);
        if (!userData?.user) return null;

        const defaultProfile = {
          id: userId,
          email: userData.user.email || '',
          role: 'employee' as const,
          permissions: getDefaultPermissions('employee'),
          store_ids: [],
          managed_stores: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([defaultProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }

        return newProfile as UserProfile;
      }
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      return existingProfile as UserProfile;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const hasPermission = (permission: keyof UserPermissions) => {
    return profile?.permissions?.[permission] || false;
  };

  const canAccessStore = (storeId: string) => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    return profile.store_ids?.includes(storeId) || profile.managed_stores?.includes(storeId) || false;
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }

        if (session?.user && mounted) {
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile && mounted) {
            setProfile(userProfile);
          }
        } else if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile && mounted) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, hasPermission, canAccessStore }}>
      {children}
    </AuthContext.Provider>
  );
}