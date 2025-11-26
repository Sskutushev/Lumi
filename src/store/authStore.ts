import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any;
  session: any;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  
  signIn: async () => {
    // OAuth sign in is handled directly in the component
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      set({ user: null, session: null });
    }
  },
  
  checkSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      set({ user: null, session: null, loading: false });
    } else {
      set({ 
        user: session?.user || null, 
        session,
        loading: false 
      });
    }
  }
}));

// Subscribe to auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    useAuthStore.setState({ 
      user: session?.user || null, 
      session,
      loading: false 
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ 
      user: null, 
      session: null,
      loading: false 
    });
  }
});