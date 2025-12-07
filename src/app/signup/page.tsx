"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userRole: null as 'scout' | 'player' | null,
    clubName: '' // For scouts
  });
  const [isLoading, setIsLoading] = useState(false);
  const [roleSelected, setRoleSelected] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.password || !formData.userRole) {
      toast.error("Please fill in all fields and select a role");
      return;
    }

    setIsLoading(true);
    
    // Add this check to provide a fallback URL if env variable is undefined
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    
    try {
      const signupData: {
        name: string;
        email: string;
        password: string;
        role: string;
        clubName?: string;
      } = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.userRole.toUpperCase()
      };

      // Add clubName for scouts
      if (formData.userRole === 'scout' && formData.clubName) {
        signupData.clubName = formData.clubName;
      }

      const response = await axios.post(`${backendUrl}/api/auth/signup`, signupData);

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Show success toast
      toast.success("Account created successfully! Please login to continue.");

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      // Handle signup error
      console.error('Signup failed:', error);
      toast.error(
        (error as AxiosError<{message: string}>).response?.data?.message || 
        "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto">
        {/* Signup Hero Section */}
        <div className="relative w-full rounded-xl overflow-hidden bg-zinc-950 mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"></div>

          <div className="relative z-10 px-6 py-12 md:px-10 md:py-16 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Create Your <span className="text-red-500">Next</span>Kick Account
            </h1>

            <p className="text-white/80 text-lg mb-8">
              Join our platform and track your athletic journey
            </p>
          </div>
        </div>

        {/* Role Selection Section - Show first */}
        {!roleSelected ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select Your Role</h2>
              <p className="text-zinc-400">Choose how you want to use the platform</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scout Role Card */}
              <div 
                onClick={() => {
                  setFormData(prev => ({...prev, userRole: 'scout'}));
                  setRoleSelected(true);
                }}
                className="bg-zinc-950 p-8 rounded-xl cursor-pointer transition-all duration-300 text-center hover:bg-zinc-900 hover:ring-2 hover:ring-red-600"
              >
                <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-6">
                  <svg 
                    className="w-10 h-10 text-white" 
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
                <h3 className="text-white font-semibold text-xl mb-2">Scout</h3>
                <p className="text-zinc-400 text-sm">Access player analytics and manage verifications</p>
              </div>

              {/* Player Role Card */}
              <div 
                onClick={() => {
                  setFormData(prev => ({...prev, userRole: 'player'}));
                  setRoleSelected(true);
                }}
                className="bg-zinc-950 p-8 rounded-xl cursor-pointer transition-all duration-300 text-center hover:bg-zinc-900 hover:ring-2 hover:ring-red-600"
              >
                <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-6">
                  <svg 
                    className="w-10 h-10 text-white" 
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
                <h3 className="text-white font-semibold text-xl mb-2">Player</h3>
                <p className="text-zinc-400 text-sm">Track your performance and upload match videos</p>
              </div>
            </div>
          </div>
        ) : (
          /* Signup Form Section - Show after role selection */
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="space-y-6">
              {/* Back Button */}
              <div className="mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setRoleSelected(false);
                    setFormData(prev => ({...prev, userRole: null}));
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  ← Change Role
                </Button>
              </div>

              {/* Selected Role Display */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                    {formData.userRole === 'scout' ? (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Signing up as</p>
                    <p className="text-white font-semibold capitalize">{formData.userRole}</p>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input 
                  type="text" 
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:ring-red-600"
                />
              </div>

              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input 
                  type="email" 
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:ring-red-600"
                />
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input 
                  type="password" 
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:ring-red-600"
                />
              </div>

              {/* Club Name Input (for scouts only) */}
              {formData.userRole === 'scout' && (
                <div>
                  <Label htmlFor="clubName" className="text-white">Club Name (Optional)</Label>
                  <Input 
                    type="text" 
                    id="clubName"
                    name="clubName"
                    placeholder="Enter your club name"
                    value={formData.clubName}
                    onChange={handleInputChange}
                    className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:ring-red-600"
                  />
                  <p className="text-zinc-500 text-xs mt-1">Your club affiliation</p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                disabled={!formData.name || !formData.email || !formData.password || !formData.userRole || isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full mt-6"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        )}

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-white/80">
            Already have an account? {' '}
            <Link href="/login" className="text-red-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}