"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface ProfileCompletion {
  completionPercentage: number;
  missingFields: string[];
  isComplete: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

export default function ProfileCompletionPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchProfileCompletion();
  }, [router]);

  const fetchProfileCompletion = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.get(`${backendUrl}/api/user/profile-completion`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile completion:', error);
      toast.error('Failed to load profile completion data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Verified</span>
          </div>
        );
      case 'PENDING':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Pending Verification</span>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!profileData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Failed to load profile data</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="bg-zinc-950 rounded-xl p-8 border border-zinc-800">
          <h1 className="text-3xl font-bold text-white mb-6">Profile Completion</h1>

          {/* Completion Percentage */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400">Profile Completion</span>
              <span className="text-3xl font-bold text-white">{profileData.completionPercentage}%</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-4">
              <div
                className="bg-red-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${profileData.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Verification Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Verification Status</h2>
            {getStatusBadge(profileData.verificationStatus)}
            {profileData.verificationStatus === 'PENDING' && (
              <p className="text-zinc-400 mt-4">
                Your profile is pending verification by a scout. Once verified, you'll be able to upload videos.
              </p>
            )}
            {profileData.verificationStatus === 'REJECTED' && (
              <p className="text-red-400 mt-4">
                Your profile verification was rejected. Please update your profile and try again.
              </p>
            )}
          </div>

          {/* Missing Fields */}
          {profileData.missingFields.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Missing Fields</h2>
              <div className="space-y-2">
                {profileData.missingFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2 text-zinc-400">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>{field}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/playerprofile')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {profileData.isComplete ? 'Update Profile' : 'Complete Profile'}
            </Button>
            {profileData.isComplete && profileData.verificationStatus === 'VERIFIED' && (
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="border-zinc-800 text-white hover:bg-zinc-900"
              >
                Go to Dashboard
              </Button>
            )}
          </div>

          {/* Info Message */}
          {!profileData.isComplete && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                You need to complete your profile (100%) and be verified by a scout before you can upload videos.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

