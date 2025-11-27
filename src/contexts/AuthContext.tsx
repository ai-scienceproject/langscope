'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lazy create Supabase client - only when needed and in browser
  const getSupabaseClient = () => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      return createClient();
    } catch (err) {
      console.warn('Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.', err);
      return null;
    }
  };

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(convertSupabaseUserToUser(session.user));
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(convertSupabaseUserToUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const convertSupabaseUserToUser = (supabaseUser: SupabaseUser): User => {
    const metadata = supabaseUser.user_metadata || {};
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: metadata.name || metadata.full_name || supabaseUser.email?.split('@')[0] || 'User',
      role: (metadata.role || 'user') as 'user' | 'admin' | 'judge',
      avatar: supabaseUser.user_metadata?.avatar_url,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
    };
  };

  const login = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add environment variables.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      setUser(convertSupabaseUserToUser(data.user));
    }
  };

  const signup = async (data: { name: string; email: string; password: string }) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add environment variables.');
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          full_name: data.name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (authData.user) {
      setUser(convertSupabaseUserToUser(authData.user));
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add environment variables.');
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
  };

  const refreshUser = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      setUser(convertSupabaseUserToUser(supabaseUser));
    }
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add environment variables.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signInWithGitHub = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add environment variables.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        signInWithGoogle,
        signInWithGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

