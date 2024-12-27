import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthCallbackProps {
  onSessionLoaded: (session: Session | null) => void;
}

export function AuthCallback({ onSessionLoaded }: AuthCallbackProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm max-w-md text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export function AuthCallbackHandler() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(`Authentication error: ${sessionError.message}`);
          throw sessionError;
        }

        if (session) {
          navigate('/', { replace: true });
        } else {
          setError('No valid session found');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        setError(`Authentication error: ${errorMessage}`);
        navigate('/login', { 
          replace: true,
          state: { error: errorMessage }
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return <AuthCallback onSessionLoaded={(session) => {
    // This callback can be used by parent components to handle session state
    // For now, we're handling navigation directly in the effect
  }} />;
}

export default AuthCallbackHandler; 