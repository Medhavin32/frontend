"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Mail, Phone, MapPin, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Player {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  country?: string;
  profilePicture?: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  playerProfile?: {
    age: number;
    position: string;
    club?: string;
    nationality?: string;
  };
}

export default function ScoutDashboard() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isUnverified, setIsUnverified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [verificationRemarks, setVerificationRemarks] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (userData.role?.toLowerCase() !== 'scout') {
        router.push('/');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }

    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pagination.page]);

  const fetchPlayers = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    try {
      const params: Record<string, string | number> = {
        page: pagination.page,
        limit: pagination.limit
      };

      // Note: Backend automatically filters to show only VERIFIED players
      // Scouts cannot filter by verification status

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get(`${backendUrl}/api/scout/players`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params
      });

      setPlayers(response.data.players || []);
      setPagination(response.data.pagination || pagination);
      setIsUnverified(false); // Reset unverified state on success
    } catch (error: unknown) {
      console.error('Failed to fetch players:', error);
      
      // Check if scout is not verified
      if (axios.isAxiosError(error) && error.response?.status === 403 && error.response?.data?.error === 'Scout not verified') {
        setIsUnverified(true);
        setVerificationStatus(error.response.data.verificationStatus || 'PENDING');
        setVerificationRemarks(error.response.data.verificationRemarks || '');
        toast.error(error.response.data.message || 'You are not verified by admin');
      } else {
        toast.error('Failed to load players');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPlayers();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading players...</div>
        </div>
      </AppLayout>
    );
  }

  // Show unverified message if scout is not verified
  if (isUnverified) {
    return (
      <AppLayout>
        <div className="w-full max-w-4xl mx-auto py-8">
          <div className="bg-zinc-950 rounded-xl p-8 border border-zinc-800">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Verification Required</h1>
              <p className="text-zinc-400 text-lg mb-6">
                You are not verified by admin. Please wait for admin verification to access player data.
              </p>
              
              <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-zinc-800">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-zinc-400">Verification Status:</span>
                  {verificationStatus === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Pending
                    </span>
                  )}
                  {verificationStatus === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                      <XCircle className="h-4 w-4" />
                      Rejected
                    </span>
                  )}
                </div>
                
                {verificationRemarks && (
                  <div className="mt-4">
                    <p className="text-zinc-400 text-sm mb-2">Admin Remarks:</p>
                    <p className="text-zinc-300">{verificationRemarks}</p>
                  </div>
                )}
              </div>

              <p className="text-zinc-500 text-sm">
                Once an admin verifies your account, you will be able to view player profiles, videos, and performance statistics.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Scout Dashboard</h1>
          <p className="text-zinc-400">View verified player profiles, videos, and performance stats</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-zinc-950 rounded-xl p-6 mb-6 border border-zinc-800">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Showing Verified Players Only</span>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Link key={player.id} href={`/scout/players/${player.id}`}>
              <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-red-600 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {player.profilePicture ? (
                      <Image
                        src={player.profilePicture}
                        alt={player.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                        <User className="h-8 w-8 text-zinc-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-semibold text-lg">{player.name}</h3>
                      {getStatusBadge(player.verificationStatus)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>{player.email}</span>
                  </div>
                  {player.phoneNumber && (
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{player.countryCode} {player.phoneNumber}</span>
                    </div>
                  )}
                  {(player.city || player.state || player.country) && (
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {[player.city, player.state, player.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {player.playerProfile && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <div className="text-zinc-400 text-sm">
                        <span className="font-medium text-white">Position:</span> {player.playerProfile.position}
                      </div>
                      {player.playerProfile.age && (
                        <div className="text-zinc-400 text-sm">
                          <span className="font-medium text-white">Age:</span> {player.playerProfile.age}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              variant="outline"
              className="border-zinc-800 text-white"
            >
              Previous
            </Button>
            <span className="text-zinc-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              variant="outline"
              className="border-zinc-800 text-white"
            >
              Next
            </Button>
          </div>
        )}

        {players.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-zinc-400">No players found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

