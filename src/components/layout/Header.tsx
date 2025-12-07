"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          setIsLoggedIn(true);
          setUserRole(userData.role.toLowerCase());
        } catch (error) {
          // Clear invalid localStorage data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
        }
      }
    };

    // Check initial auth status
    checkAuthStatus();

    // Add event listener for storage changes (useful for multi-tab sync)
    window.addEventListener('storage', checkAuthStatus);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const onClickLogin = () => {
    router.push('/login');
  };

  const onClickSignUp = () => {
    router.push('/signup');
  };

  const onClickLogout = () => {
    // Remove tokens and user data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('user');

    // Update authentication state
    setIsLoggedIn(false);
    setUserRole(null);

    // Show logout toast
    toast.success("Logged out successfully");

    // Redirect to home page
    router.push('/');
  };


  return (
    <header className="fixed top-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-sm z-50 border-b border-zinc-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
            {/* Logo or icon can be added here */}
          </div>
          <div className="hidden md:flex h-0.5 w-10 bg-red-600"></div>
        </div>

        <nav className="flex items-center gap-8">
          {/* Only show HOME link for players */}
          {userRole !== 'scout' && (
            <Link
              href="/"
              className="text-white font-medium group relative transition-colors duration-300 py-1"
            >
              HOME
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          )}
          <Link
            href="/features"
            className="text-white font-medium group relative transition-colors duration-300 py-1"
          >
            FEATURES
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
          
          <Link
            href="/contact"
            className="text-white font-medium group relative transition-colors duration-300 py-1"
          >
            CONTACT
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300 mr-2"
                onClick={onClickLogin}
              >
                LOGIN
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
                onClick={onClickSignUp}
              >
                SIGN UP
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
              onClick={onClickLogout}
            >
              LOGOUT
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}