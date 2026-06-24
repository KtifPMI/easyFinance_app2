import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { User } from '../types'

const USER_KEY = 'ef_user'

interface AuthState {
  user: User | null
  isLoading: boolean
  isInitializing: boolean
  error: string | null
  init: () => Promise<void>
  login: (login: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitializing: true,
  error: null,

  init: async () => {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY)
      if (userJson) set({ user: JSON.parse(userJson) })
    } finally {
      set({ isInitializing: false })
    }
  },

  login: async (login: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const user: User = { id: 'u1', name: login, email: login, currency: 'RUB', plan: 'free' }
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
      set({ user, isLoading: false })
    } catch (e: any) {
      set({ error: e.message || 'Ошибка входа', isLoading: false })
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(USER_KEY)
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
