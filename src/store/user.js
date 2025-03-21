import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      userId: null,
      transactionId: null,
      foreclosureTransactionId: null,
      prepaymentTransactionId: null,
      MissedemiTransactionID: null,
      providerId: null,
      igmTransactionId: null,
      isAuthenticated: false,
      originalRequest: null, // Add this line

      setAuth: (token, userId) => set({
        token,
        userId,
        isAuthenticated: true,
      }),

      setTransactionId: (transactionId) => set({
        transactionId,
      }),

      setForeclosureTransactionId: (foreclosureTransactionId) => set({
        foreclosureTransactionId,
      }),

      setprepaymentTransactionId: (prepaymentTransactionId) => set({
        prepaymentTransactionId,
      }),
      setMissedemiTransactionID: (MissedemiTransactionID) => set({
        MissedemiTransactionID,
      }),

      setProviderId: (providerId) => set({
        providerId,
      }),

      setIgmTransactionId: (igmTransactionId) => set({
        igmTransactionId,
      }),

      setOriginalRequest: (originalRequest) => set({ // Add this action
        originalRequest,
      }),

      clearAuth: () => set({
        token: null,
        userId: null,
        transactionId: null,
        foreclosureTransactionId: null,
        prepaymentTransactionId: null,
        MissedemiTransactionID: null,
        igmTransactionId: null,
        providerId: null,
        isAuthenticated: false,
        originalRequest: null, // Clear originalRequest
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore