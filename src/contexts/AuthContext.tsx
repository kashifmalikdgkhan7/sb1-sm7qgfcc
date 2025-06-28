import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserDatabase, UserAccount } from '../services/userDatabase';

interface AuthContextType {
  user: UserAccount | null;
  sessionId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserAccount>) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on app load
    const storedSessionId = localStorage.getItem('talko_session_id');
    if (storedSessionId) {
      const sessionValidation = UserDatabase.validateSession(storedSessionId);
      if (sessionValidation.valid && sessionValidation.userId) {
        const users = JSON.parse(localStorage.getItem('talko_users') || '[]');
        const currentUser = users.find((u: UserAccount) => u.id === sessionValidation.userId);
        if (currentUser) {
          setUser(currentUser);
          setSessionId(storedSessionId);
        } else {
          localStorage.removeItem('talko_session_id');
        }
      } else {
        localStorage.removeItem('talko_session_id');
      }
    }
    setLoading(false);

    // Cleanup expired sessions periodically
    const cleanupInterval = setInterval(() => {
      UserDatabase.cleanupExpiredSessions();
    }, 60000); // Every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const authenticatedUser = await UserDatabase.authenticateUser(email, password);
      const newSessionId = UserDatabase.createSession(authenticatedUser.id);
      
      setUser(authenticatedUser);
      setSessionId(newSessionId);
      localStorage.setItem('talko_session_id', newSessionId);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const newUser = await UserDatabase.createUser(email, password, name);
      const newSessionId = UserDatabase.createSession(newUser.id);
      
      setUser(newUser);
      setSessionId(newSessionId);
      localStorage.setItem('talko_session_id', newSessionId);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (sessionId) {
      UserDatabase.destroySession(sessionId);
    }
    localStorage.removeItem('talko_session_id');
    setUser(null);
    setSessionId(null);
    setError(null);
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setError(null);
      await UserDatabase.updatePassword(user.id, currentPassword, newPassword);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password update failed');
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserAccount>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setError(null);
      const updatedUser = await UserDatabase.updateUserProfile(user.id, updates);
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    sessionId,
    login,
    register,
    logout,
    updatePassword,
    updateProfile,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};