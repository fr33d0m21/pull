import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { getDefaultPermissions } from '../lib/setupAdmin';

interface StoreUserManagerProps {
  storeId: string;
  onClose: () => void;
}

export default function StoreUserManager({ storeId, onClose }: StoreUserManagerProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newUser, setNewUser] = useState({ email: '', role: 'employee' as UserRole });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [storeId]);

  const fetchUsers = async () => {
    try {
      // If admin, fetch all users assigned to this store
      // If manager, fetch only workers created by this manager
      const query = supabase
        .from('user_profiles')
        .select('*')
        .contains('store_ids', [storeId]);

      if (profile?.role === 'manager') {
        query.eq('created_by', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !profile) return;

    try {
      setLoading(true);
      setError('');

      // Check if user exists in auth
      const { data: existingAuth } = await supabase.auth.admin.listUsers();
      const existingAuthUser = existingAuth?.users?.find(u => u.email === newUser.email);

      // Check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', newUser.email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      let userId = existingAuthUser?.id;

      // If no auth user exists, create one
      if (!existingAuthUser) {
        const tempPassword = Math.random().toString(36).slice(-8);
        const { data: newAuth, error: authError } = await supabase.auth.signUp({
          email: newUser.email,
          password: tempPassword,
        });

        if (authError) throw authError;
        if (!newAuth.user) throw new Error('Failed to create auth user');

        userId = newAuth.user.id;
        alert(`User created! Temporary password: ${tempPassword}\nPlease share this with the user.`);
      }

      if (existingProfile) {
        // Update existing profile
        const updatedStoreIds = [...new Set([...(existingProfile.store_ids || []), storeId])];
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            store_ids: updatedStoreIds,
            // Only update role if the current user is an admin
            ...(profile.role === 'admin' ? { role: newUser.role } : {})
          })
          .eq('id', existingProfile.id);

        if (updateError) throw updateError;
      } else if (userId) {
        // Create new profile
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: newUser.email,
            role: profile.role === 'manager' ? 'employee' : newUser.role,
            permissions: getDefaultPermissions(profile.role === 'manager' ? 'employee' : newUser.role),
            store_ids: [storeId],
            created_by: profile.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) throw createError;
      }

      setNewUser({ email: '', role: 'employee' });
      await fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      setLoading(true);
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Remove store from user's store_ids
      const updatedStoreIds = (user.store_ids || []).filter(id => id !== storeId);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ store_ids: updatedStoreIds })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user');
    } finally {
      setLoading(false);
    }
  };

  if (!profile?.role || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Manage Store Users
                </h3>

                {error && (
                  <div className="mt-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAddUser} className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="User email"
                      value={newUser.email}
                      onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                    {profile.role === 'admin' && (
                      <select
                        value={newUser.role}
                        onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                      </select>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add
                    </button>
                  </div>
                </form>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Current Users</h4>
                  <ul className="mt-2 divide-y divide-gray-200">
                    {users.map(user => (
                      <li key={user.id} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.role}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          disabled={loading}
                          className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}