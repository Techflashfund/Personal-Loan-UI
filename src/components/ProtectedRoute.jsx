// components/ProtectedRoute.js
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '../store/user';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/signin', '/signup','/reset',"/offer",'/kfs','/disbursement'];

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Access auth state directly from the Zustand store
  const { token, userId, isAuthenticated } = useAuthStore();
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  useEffect(() => {
    // If not on a public route and not authenticated, redirect to signin
    if (!isPublicRoute && (!token || !userId || !isAuthenticated)) {
      router.push(`/signin?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, token, userId, isAuthenticated, router, isPublicRoute]);
  
  // For public routes, or if authenticated, render the children
  return children;
}