import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types';

const USERS_STORAGE_KEY = '@cosumar_users';
const CURRENT_USER_KEY = '@cosumar_current_user';

const hashPassword = async (password: string): Promise<string> => {
  return `hashed_${password}`;
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashed = await hashPassword(password);
  return hashed === hash;
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, currentUserData] = await Promise.all([
        AsyncStorage.getItem(USERS_STORAGE_KEY),
        AsyncStorage.getItem(CURRENT_USER_KEY),
      ]);

      if (usersData) {
        const parsedUsers = JSON.parse(usersData);
        setUsers(parsedUsers);
      } else {
        const adminUser: User = {
          id: 'admin-001',
          matricule: 'ADMIN001',
          nom: 'Admin',
          prenom: 'COSUMAR',
          departement: 'RH',
          metier: 'Administrateur',
          email: 'admin@cosumar.ma',
          passwordHash: await hashPassword('admin123'),
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        const initialUsers = [adminUser];
        setUsers(initialUsers);
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      }

      if (currentUserData) {
        setCurrentUser(JSON.parse(currentUserData));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = useCallback(async (userData: {
    matricule: string;
    nom: string;
    prenom: string;
    departement: string;
    metier: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingUser = users.find(
        (u) => u.matricule === userData.matricule || u.email === userData.email
      );

      if (existingUser) {
        return {
          success: false,
          error: 'Un utilisateur avec ce matricule ou email existe déjà',
        };
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        matricule: userData.matricule,
        nom: userData.nom,
        prenom: userData.prenom,
        departement: userData.departement,
        metier: userData.metier,
        email: userData.email,
        passwordHash: await hashPassword(userData.password),
        role: 'employee',
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

      return { success: true };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  }, [users]);

  const login = useCallback(async (
    matricule: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const user = users.find((u) => u.matricule === matricule);

      if (!user) {
        return { success: false, error: 'Matricule ou mot de passe incorrect' };
      }

      const isValid = await verifyPassword(password, user.passwordHash);

      if (!isValid) {
        return { success: false, error: 'Matricule ou mot de passe incorrect' };
      }

      setCurrentUser(user);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  }, [users]);

  const logout = useCallback(async () => {
    try {
      setCurrentUser(null);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  const getAllUsers = useCallback((): User[] => {
    return users;
  }, [users]);

  return useMemo(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      isAdmin: currentUser?.role === 'admin',
      isLoading,
      register,
      login,
      logout,
      getAllUsers,
    }),
    [currentUser, isLoading, register, login, logout, getAllUsers]
  );
});
