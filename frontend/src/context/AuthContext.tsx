import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as authApi from '../api/auth';
import { ApiError } from '../api/client';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(result: authApi.AuthResult): User {
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

function persistSession(result: authApi.AuthResult) {
  localStorage.setItem('authToken', result.token);
  const user = toUser(result);
  localStorage.setItem('taskManagerUser', JSON.stringify(user));
  return user;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('taskManagerUser');
    const token = localStorage.getItem('authToken');
    if (storedUser && token) {
      const parsed = JSON.parse(storedUser) as User;
      if (!parsed.weeklyGoal || parsed.weeklyGoal <= 0) {
        parsed.weeklyGoal = 20;
      }
      setUser(parsed);
    } else {
      localStorage.removeItem('taskManagerUser');
      localStorage.removeItem('authToken');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authApi.login(email, password);
      setUser(persistSession(result));
      return true;
    } catch (error) {
      if (!(error instanceof ApiError)) {
        // network / unexpected
      }
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const result = await authApi.register(username, email, password);
      setUser(persistSession(result));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskManagerUser');
    localStorage.removeItem('authToken');
  };

  const getAuthToken = () => localStorage.getItem('authToken');

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, getAuthToken }}>
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
