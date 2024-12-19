import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          // Get the intended destination from localStorage or default to home
          const destination = localStorage.getItem('authRedirect') || '/';
          localStorage.removeItem('authRedirect'); // Clean up
          navigate(destination, { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login', { 
          replace: true,
          state: { error: 'Authentication failed. Please try again.' }
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    </div>
  );
} 