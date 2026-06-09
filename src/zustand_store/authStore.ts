import { create } from 'zustand';

import type { IUser } from '@/types';
import { getCurrentUser } from '@/lib/appwrite/api';

export const INITIAL_USER = {
  id: '',
  name: '',
  username: '',
  email: '',
  imageUrl: '',
  bio: '',
};

export type AuthState = {
  user: IUser;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: IUser) => void;
  setIsAuthenticated: (value: boolean) => void;
  checkAuthUser: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) => set({ user }),

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  checkAuthUser: async () => {
    try {
      set({ isLoading: true });

      // fetch current logged in user
      const currentUser = await getCurrentUser();

      if (currentUser) {
        set({
          user: {
            id: currentUser.$id,
            name: currentUser.name,
            username: currentUser.username,
            email: currentUser.email,
            imageUrl: currentUser.imageUrl,
            bio: currentUser.bio,
          },
          isAuthenticated: true,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
