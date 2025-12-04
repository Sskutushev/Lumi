import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // If the user object is available, the onAuthStateChange listener has fired.
    // We can safely navigate to the dashboard.
    if (user) {
      navigate('/');
    }

    // Set a timeout to prevent getting stuck on this page if auth fails silently.
    const timeoutId = setTimeout(() => {
      console.error('Auth callback timed out. Redirecting to home.');
      navigate('/');
    }, 10000); // 10-second timeout

    return () => clearTimeout(timeoutId);
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
        <p className="mt-4 text-text-tertiary">Finalizing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
