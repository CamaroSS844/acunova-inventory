import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { StaffMember } from '../../types';
import { getStaff } from '../../services/staffService';
import { initialStaff } from '../../data/initialData'; // Fallback

const CURRENT_USER_KEY = 'ac_currentUser';

interface AuthContextType {
  currentUser: StaffMember | null;
  allStaff: StaffMember[];
  login: (staffId: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
        try {
            const staffList = await getStaff();
            setAllStaff(staffList);

            const storedUserJson = localStorage.getItem(CURRENT_USER_KEY);
            if (storedUserJson) {
                const storedUser = JSON.parse(storedUserJson);
                // Verify the stored user still exists in the main staff list
                const userExists = staffList.some(s => s.id === storedUser.id);
                if (userExists) {
                    setCurrentUser(storedUser);
                } else {
                    // Stored user is stale, default to the first user
                    setCurrentUser(staffList[0]);
                    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(staffList[0]));
                }
            } else if (staffList.length > 0) {
                // Default to the first user (Admin) if no user is saved
                setCurrentUser(staffList[0]);
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(staffList[0]));
            }
        } catch (error) {
            console.error("Failed to initialize auth state:", error);
            // Provide a non-async fallback in case of catastrophic failure
            setAllStaff(initialStaff); 
            setCurrentUser(initialStaff[0]);
        } finally {
            setLoading(false);
        }
    };
    
    initializeAuth();
  }, []);

  const login = (staffId: string) => {
    const userToLogin = allStaff.find(s => s.id === staffId);
    if (userToLogin) {
      setCurrentUser(userToLogin);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToLogin));
    }
  };

  const value = { currentUser, allStaff, login, loading };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};