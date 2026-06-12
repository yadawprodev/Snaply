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
  followers: [],
  following: [],
};

export type AuthState = {
  user: IUser;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: IUser) => void;
  setIsAuthenticated: (value: boolean) => void;
  checkAuthUser: () => Promise<boolean>;

  followers: string[];
  following: string[];
  setFollowers: (followers: string[]) => void;
  setFollowing: (following: string[]) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) => set({ user }),

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  followers: [],
  following: [],
  setFollowers: (followers) => set({ followers }),
  setFollowing: (following) => set({ following }),

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
            followers: currentUser.followers ?? [],
            following: currentUser.following ?? [],
          },
          isAuthenticated: true,
          followers: currentUser.followers ?? [],
          following: currentUser.following ?? [],
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
