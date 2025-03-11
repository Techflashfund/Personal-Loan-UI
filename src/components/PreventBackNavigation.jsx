// components/PreventBackNavigation.js
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '../store/user';

// Define the protected flow pages where back button should redirect to /main
const protectedFlowPages = [
  '/kycform',
  '/emandate',
  '/bankdetails',
  '/agreement'
  // Add any other pages in your flow that should redirect to /main
];

export default function PreventBackNavigation({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Only apply this logic for authenticated users
    if (!isAuthenticated) return;
    
    // Check if current page is in the protected flow
    const isProtectedFlow = protectedFlowPages.some(page => 
      pathname === page || pathname.startsWith(`${page}/`)
    );
    
    if (isProtectedFlow) {
      // Save the current page to session history
      window.history.pushState(null, '', pathname);
      
      // Add event listener for popstate (when back button is pressed)
      const handlePopState = () => {
        // Push the current page back to history to prevent going back
        window.history.pushState(null, '', pathname);
        // Redirect to /main instead
        router.push('/main');
      };
      
      window.addEventListener('popstate', handlePopState);
      
      // Cleanup event listener on unmount
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [pathname, router, isAuthenticated]);
  
  return children;
}