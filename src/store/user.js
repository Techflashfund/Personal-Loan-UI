import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      userId: null,
      transactionId: null,
      foreclosureTransactionId: null, // Added for foreclosure transaction
      providerId: null,
      isAuthenticated: false,
      
      setAuth: (token, userId) => set({
        token,
        userId,
        isAuthenticated: true,
      }),

      setTransactionId: (transactionId) => set({
        transactionId,
      }),

      setForeclosureTransactionId: (foreclosureTransactionId) => set({
        foreclosureTransactionId, // Set foreclosure transaction ID
      }),

      setProviderId: (providerId) => set({
        providerId,
      }),
      
      clearAuth: () => set({
        token: null,
        userId: null,
        transactionId: null,
        foreclosureTransactionId: null, // Clear foreclosure transaction
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
