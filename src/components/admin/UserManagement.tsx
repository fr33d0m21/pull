import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { 
  UserPlus, 
  Trash2, 
  PencilLine, 
  Building2,
  Check,
  X 
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'employee' as const
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);
      
      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', newUser.email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (existingUser) {
        alert('User already exists');
        return;
      }

      // Create auth user with random password
      const tempPassword = Math.random().toString(36).slice(-8);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: tempPassword,
        options: {
          data: {
            role: newUser.role
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: newUser.email,
            role: newUser.role,
            permissions: getDefaultPermissions(newUser.role),
            store_ids: [],
            managed_stores: []
          });

        if (profileError) throw profileError;

        alert(`User created! Temporary password: ${tempPassword}`);
        setNewUser({ email: '', role: 'employee' });
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'manager' | 'employee') => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          permissions: getDefaultPermissions(newRole)
        })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Add New User</h2>
        <div className="mt-3 flex gap-4">
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Email address"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'manager' | 'employee' }))}
            className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleAddUser}
            disabled={loading || !newUser.email}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Stores
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {editingUser === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value as 'admin' | 'manager' | 'employee')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.store_ids?.length || 0} stores
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDefaultPermissions(role: string) {
  switch (role) {
    case 'admin':
      return {
        manage_users: true,
        manage_stores: true,
        view_all_stores: true,
        edit_all_stores: true
      };
    case 'manager':
      return {
        manage_users: false,
        manage_stores: false,
        view_all_stores: false,
        edit_all_stores: false
      };
    default:
      return {
        manage_users: false,
        manage_stores: false,
        view_all_stores: false,
        edit_all_stores: false
      };
  }
}
