import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'rider' | 'driver';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, userType: 'rider' | 'driver') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Dummy authentication - accept specific demo credentials
    const dummyUsers = {
      'rider@demo.com': {
        id: 'rider_123',
        name: 'John Rider',
        email: 'rider@demo.com',
        userType: 'rider' as const
      },
      'driver@demo.com': {
        id: 'driver_456', 
        name: 'Alex Driver',
        email: 'driver@demo.com',
        userType: 'driver' as const
      }
    };
    
    // Check if email exists and password is demo123
    if (dummyUsers[email as keyof typeof dummyUsers] && password === 'demo123') {
      const userData = dummyUsers[email as keyof typeof dummyUsers];
      const token = `dummy_token_${Date.now()}`;
      
      apiClient.setToken(token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (email: string, password: string, name: string, userType: 'rider' | 'driver'): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dummy signup - create user with provided details  
    const userData = {
      id: `${userType}_${Date.now()}`,
      name,
      email,
      userType
    };
    
    const token = `dummy_token_${Date.now()}`;
    
    apiClient.setToken(token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    apiClient.logout();
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};