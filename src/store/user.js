import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      userId: null,
      transactionId: null,
      providerId:null,
      isAuthenticated: false,
      
      setAuth: (token, userId) => set({
        token,
        userId,
        isAuthenticated: true,
      }),
      
      setTransactionId: (transactionId) => set({
        transactionId,
      }),
      setProviderId: (providerId) => set({
        providerId,
      }),
      
      clearAuth: () => set({
        token: null,
        userId: null,
        transactionId: null,
        providerId: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore