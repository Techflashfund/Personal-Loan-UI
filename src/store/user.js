import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      userId: null,
      transactionId: null,
      foreclosureTransactionId: null,
      prepaymentTransactionId: null, // Added for foreclosure transaction
      providerId: null,
      igmTransactionId: null, // Added for IGMT transaction
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

      setprepaymentTransactionId: (prepaymentTransactionId) => set({
        prepaymentTransactionId, // Set prepayment transaction ID
      }),

      setProviderId: (providerId) => set({
        providerId,
      }),

      setIgmTransactionId: (igmTransactionId) => set({
        igmTransactionId, // Set IGMT transaction ID
      }),

      clearAuth: () => set({
        token: null,
        userId: null,
        transactionId: null,
        foreclosureTransactionId: null, 
        prepaymentTransactionId: null, // Clear foreclosure transaction
        igmTransactionId: null, // Clear IGMT transaction ID
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
