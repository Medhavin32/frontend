"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<'scout' | 'player' | 'admin' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check for existing authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        
        // For players, check profile completion
        if (userData.role.toLowerCase() === 'player') {
          checkProfileCompletion(token);
        } else if (userData.role.toLowerCase() === 'scout') {
          router.push('/scout/dashboard');
        } else if (userData.role.toLowerCase() === 'admin') {
          router.push('/admin/dashboard');
        }
      } catch (error) {
        // Clear invalid localStorage data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Check profile completion for players
  const checkProfileCompletion = async (token: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

    try {
      const response = await axios.get(`${backendUrl}/api/user/profile-completion`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const { completionPercentage, verificationStatus } = response.data;

      // If profile is not 100% complete, redirect to profile completion page
      if (completionPercentage < 100) {
        router.push('/profile-completion');
        return;
      }

      // If profile is complete but not verified, show message and redirect
      if (verificationStatus !== 'VERIFIED') {
        toast.info('Your profile is pending verification. You can view your dashboard but cannot upload videos yet.');
        router.push('/');
        return;
      }

      // Profile is complete and verified, go to dashboard
      router.push('/');
    } catch (error) {
      console.error('Profile completion check failed:', error);
      // If API fails, try to check if player profile exists
      try {
        await axios.get(`${backendUrl}/api/player/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        router.push('/profile-completion');
      } catch {
        router.push('/playerprofile');
      }
    }
  };

  const handleLogin = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

    // Validate inputs
    if (!selectedRole || !email || !password) {
      toast.error("Please fill in all fields and select a role");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
        role: selectedRole.toUpperCase()
      }, {
        // Add timeout to prevent hanging requests
        timeout: 10000
      });

      // Secure token storage
      const { firebaseToken, token, user } = response.data;

      // Store tokens with some basic security considerations
      localStorage.setItem('firebaseToken', firebaseToken);
      localStorage.setItem('accessToken', token);
      
      // Store user info with minimal exposed data
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }));

      // Show success toast
      toast.success("Login Successful");

      // Redirect based on role
      if (selectedRole === 'scout') {
        router.push('/scout/dashboard');
      } else if (selectedRole === 'player') {
        // Check profile completion for players
        checkProfileCompletion(token);
      } else if (selectedRole === 'admin') {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      // Comprehensive error handling
      console.error('Login failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          toast.error(
            error.response.data.message || 
            "Login failed. Please check your credentials."
          );
        } else if (error.request) {
          // The request was made but no response was received
          toast.error("No response from server. Please check your internet connection.");
        } else {
          // Something happened in setting up the request
          toast.error("An unexpected error occurred. Please try again.");
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto">
        {/* Login Hero Section */}
        <div className="relative w-full rounded-xl overflow-hidden bg-zinc-950 mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"></div>

          <div className="relative z-10 px-6 py-12 md:px-10 md:py-16 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Welcome to <span className="text-red-500">Performance</span> Analytics
            </h1>

            <p className="text-white/80 text-lg mb-8">
              Choose your role to get started
            </p>
          </div>
        </div>

        {/* Role Selection Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Scout Role Card */}
          <div 
            onClick={() => setSelectedRole('scout')}
            className={`bg-zinc-950 p-8 rounded-xl cursor-pointer transition-all duration-300 
            ${selectedRole === 'scout' ? 'ring-4 ring-red-600' : 'hover:bg-zinc-900'}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mb-6">
                <svg 
                  className="w-12 h-12 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Scout</h2>
              <p className="text-zinc-400 mb-6">
                Access detailed player analytics and performance tracking
              </p>
            </div>
          </div>

          {/* Player Role Card */}
          <div 
            onClick={() => setSelectedRole('player')}
            className={`bg-zinc-950 p-8 rounded-xl cursor-pointer transition-all duration-300 
            ${selectedRole === 'player' ? 'ring-4 ring-red-600' : 'hover:bg-zinc-900'}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mb-6">
                <svg 
                  className="w-12 h-12 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Player</h2>
              <p className="text-zinc-400 mb-6">
                View your personal performance metrics and progress
              </p>
            </div>
          </div>

          {/* Admin Role Card */}
          <div 
            onClick={() => setSelectedRole('admin')}
            className={`bg-zinc-950 p-8 rounded-xl cursor-pointer transition-all duration-300 
            ${selectedRole === 'admin' ? 'ring-4 ring-red-600' : 'hover:bg-zinc-900'}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mb-6">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Admin</h2>
              <p className="text-zinc-400 mb-6">
                Manage user verifications and system administration
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        {selectedRole && (
          <div className="mt-8 max-w-md mx-auto">
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-zinc-950 text-white border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="mt-8 text-center">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white rounded-full px-12 w-full"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : `Continue as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}