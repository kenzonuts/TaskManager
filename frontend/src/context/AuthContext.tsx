import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as authApi from '../api/auth';
import { ApiError, AUTH_EXPIRED_EVENT, isTokenValid } from '../api/client';
import { getSupabase, isSupabaseAuthEnabled } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateLocalUser: (patch: Partial<User>) => void;
  isLoading: boolean;
  getAuthToken: () => string | null;
  authProvider: 'custom' | 'supabase';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUserFromCustom(result: authApi.AuthResult): User {
  return {
    userId: result.userId,
    username: result.username,
    email: result.email,
    password: '',
    createdAt: new Date(),
    weeklyGoal: result.weeklyGoal > 0 ? result.weeklyGoal : 20,
    categories: [],
    tasks: [],
  };
}

function persistCustom(result: authApi.AuthResult) {
  localStorage.setItem('authToken', result.token);
  const user = toUserFromCustom(result);
  localStorage.setItem('taskManagerUser', JSON.stringify(user));
  return user;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authProvider = isSupabaseAuthEnabled ? 'supabase' : 'custom';

  useEffect(() => {
    const boot = async () => {
      if (isSupabaseAuthEnabled) {
        const supabase = getSupabase();
        if (!supabase) {
          setIsLoading(false);
          return;
        }
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (session?.access_token && session.user && isTokenValid(session.access_token)) {
          localStorage.setItem('authToken', session.access_token);
          const meta = session.user.user_metadata ?? {};
          const nextUser: User = {
            userId: session.user.id,
            username: (meta.username as string) || session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
            password: '',
            createdAt: new Date(),
            weeklyGoal: 20,
            categories: [],
            tasks: [],
          };
          localStorage.setItem('taskManagerUser', JSON.stringify(nextUser));
          setUser(nextUser);
        } else {
          localStorage.removeItem('taskManagerUser');
          localStorage.removeItem('authToken');
        }
        setIsLoading(false);
        return;
      }

      const storedUser = localStorage.getItem('taskManagerUser');
      const token = localStorage.getItem('authToken');
      if (storedUser && isTokenValid(token)) {
        const parsed = JSON.parse(storedUser) as User;
        if (!parsed.weeklyGoal || parsed.weeklyGoal <= 0) parsed.weeklyGoal = 20;
        setUser(parsed);
      } else {
        localStorage.removeItem('taskManagerUser');
        localStorage.removeItem('authToken');
      }
      setIsLoading(false);
    };

    void boot();
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (isSupabaseAuthEnabled) {
        const supabase = getSupabase();
        if (!supabase) return false;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) return false;
        localStorage.setItem('authToken', data.session.access_token);
        const meta = data.user.user_metadata ?? {};
        const nextUser: User = {
          userId: data.user.id,
          username: (meta.username as string) || email.split('@')[0],
          email: data.user.email || email,
          password: '',
          createdAt: new Date(),
          weeklyGoal: 20,
          categories: [],
          tasks: [],
        };
        localStorage.setItem('taskManagerUser', JSON.stringify(nextUser));
        setUser(nextUser);
        return true;
      }

      const result = await authApi.login(email, password);
      setUser(persistCustom(result));
      return true;
    } catch (error) {
      if (!(error instanceof ApiError)) {
        // network
      }
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      if (isSupabaseAuthEnabled) {
        const supabase = getSupabase();
        if (!supabase) return false;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) return false;
        if (data.session?.access_token && data.user) {
          localStorage.setItem('authToken', data.session.access_token);
          const nextUser: User = {
            userId: data.user.id,
            username,
            email: data.user.email || email,
            password: '',
            createdAt: new Date(),
            weeklyGoal: 20,
            categories: [],
            tasks: [],
          };
          localStorage.setItem('taskManagerUser', JSON.stringify(nextUser));
          setUser(nextUser);
          return true;
        }
        // Email confirmation may be required — treat as success without session
        return true;
      }

      const result = await authApi.register(username, email, password);
      setUser(persistCustom(result));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskManagerUser');
    localStorage.removeItem('authToken');
    if (isSupabaseAuthEnabled) {
      void getSupabase()?.auth.signOut();
    }
  };

  const updateLocalUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem('taskManagerUser', JSON.stringify(next));
      return next;
    });
  };

  const getAuthToken = () => localStorage.getItem('authToken');

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateLocalUser,
        isLoading,
        getAuthToken,
        authProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
