import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('taskManagerUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5091/api/Users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
      
        if (userData.token) {
          localStorage.setItem('authToken', userData.token);
          try {
            const payload = JSON.parse(atob(userData.token.split('.')[1]));
            console.log('JWT payload:', payload);
            const tokenUserId = payload.sub;
            console.log('User ID from token:', tokenUserId);

            const loggedInUser: User = {
              userId: tokenUserId,
              username: userData.username || payload.unique_name || email.split('@')[0],
              email: userData.email || payload.email || email,
              password: '',
              createdAt: new Date(),
              categories: [],
              tasks: []
            };
            setUser(loggedInUser);
            localStorage.setItem('taskManagerUser', JSON.stringify(loggedInUser));
            return true;
          } catch (tokenError) {
            console.error('Error decoding token:', tokenError);
            const loggedInUser: User = {
              userId: userData.userId || crypto.randomUUID(),
              username: userData.username || email.split('@')[0],
              email: userData.email || email,
              password: '',
              createdAt: new Date(),
              categories: [],
              tasks: []
            };
            setUser(loggedInUser);
            localStorage.setItem('taskManagerUser', JSON.stringify(loggedInUser));
            return true;
          }
        } else {
          const loggedInUser: User = {
            userId: userData.userId || crypto.randomUUID(),
            username: userData.username || email.split('@')[0],
            email: userData.email || email,
            password: '',
            createdAt: new Date(),
            categories: [],
            tasks: []
          };
          setUser(loggedInUser);
          localStorage.setItem('taskManagerUser', JSON.stringify(loggedInUser));
          return true;
        }
      } else {
        const errorText = await response.text();
        console.error('Login failed with status:', response.status, 'Response:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5091/api/Users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        
        const newUser: User = {
          userId: userData.userId || crypto.randomUUID(),
          username: userData.username || username,
          email: userData.email || email,
          password: '', 
          createdAt: new Date(),
          categories: [],
          tasks: []
        };
        setUser(newUser);
        localStorage.setItem('taskManagerUser', JSON.stringify(newUser));
        return true;
      } else {
        // Log detail error untuk debugging
        const errorText = await response.text();
        console.error('Registration failed with status:', response.status, 'Response:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskManagerUser');
    localStorage.removeItem('authToken');
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

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
