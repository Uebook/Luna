// src/store/userStore.js
import { create } from 'zustand';

const useUserStore = create((set) => ({
  user: null,

  // Actions
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
