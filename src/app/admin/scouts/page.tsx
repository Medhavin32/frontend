"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, Filter, User, Mail, Phone, MapPin, 
  CheckCircle2, XCircle, AlertCircle, ArrowLeft,
  Shield, Building2, Video, Calendar
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Scout {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  profilePicture?: string;
  clubName?: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verificationRemarks?: string;
  verifiedAt?: string;
  createdAt?: string;
  videoSelections?: Array<{
    id: string;
    status: string;
    createdAt: string;
    video?: {
      title?: string;
      playerProfile?: {
        user?: {
          name?: string;
        };
      };
    };
  }>;
}

function AdminScoutsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);
  const [scoutDetails, setScoutDetails] = useState<Scout | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (userData.role?.toLowerCase() !== 'admin') {
        router.push('/');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }

    fetchScouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, filterStatus, pagination.page]);

  const fetchScouts = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    try {
      const params: Record<string, string | number> = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filterStatus !== 'all') {
        params.verificationStatus = filterStatus;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get(`${backendUrl}/api/admin/scouts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params
      });

      setScouts(response.data.scouts || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Failed to fetch scouts:', error);
      toast.error('Failed to load scouts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScoutDetails = async (scoutId: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    setIsLoadingDetails(true);
    try {
      const response = await axios.get(`${backendUrl}/api/admin/scouts/${scoutId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setScoutDetails(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to fetch scout details:', error);
      toast.error('Failed to load scout details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleVerification = async (scoutId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    setIsVerifying(true);
    try {
      await axios.put(
        `${backendUrl}/api/admin/scouts/${scoutId}/verify`,
        { status, remarks: remarks || undefined },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      toast.success(`Scout marked as ${status}`);
      setSelectedScout(null);
      setShowDetails(false);
      setScoutDetails(null);
      setRemarks('');
      fetchScouts();
    } catch (error) {
      console.error('Failed to verify scout:', error);
      toast.error('Failed to update verification status');
    } finally {
      setIsVerifying(false);
    }
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
          <div className="text-white">Loading scouts...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto py-8">
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="text-zinc-400 hover:text-white mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-red-500" />
            <h1 className="text-3xl font-bold text-white">Scout Verifications</h1>
          </div>
          <p className="text-zinc-400">Review and verify scout accounts</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-zinc-950 rounded-xl p-6 mb-6 border border-zinc-800">
          <form onSubmit={(e) => { e.preventDefault(); setPagination(prev => ({ ...prev, page: 1 })); fetchScouts(); }} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search by name, email, phone, or club..."
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
            <Filter className="h-5 w-5 text-zinc-400" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Scouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scouts.map((scout) => (
            <div
              key={scout.id}
              onClick={() => fetchScoutDetails(scout.id)}
              className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-red-600 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {scout.profilePicture ? (
                      <Image
                        src={scout.profilePicture}
                        alt={scout.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{scout.name}</h3>
                    {getStatusBadge(scout.verificationStatus)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{scout.email}</span>
                </div>
                {scout.clubName && (
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium text-white">{scout.clubName}</span>
                  </div>
                )}
                {scout.phoneNumber && (
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{scout.countryCode} {scout.phoneNumber}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedScout(scout);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Verify Scout
              </Button>
            </div>
          ))}
        </div>

        {/* Scout Details Modal */}
        {showDetails && scoutDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Scout Details</h2>
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    setScoutDetails(null);
                  }}
                  variant="ghost"
                  className="text-zinc-400 hover:text-white"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              {/* Profile Section */}
              <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-zinc-800">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative w-30 h-30 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {scoutDetails.profilePicture ? (
                      <Image
                        src={scoutDetails.profilePicture}
                        alt={scoutDetails.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{scoutDetails.name}</h3>
                    {getStatusBadge(scoutDetails.verificationStatus)}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Mail className="h-4 w-4" />
                        <span>{scoutDetails.email}</span>
                      </div>
                      {scoutDetails.phoneNumber && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Phone className="h-4 w-4" />
                          <span>{scoutDetails.countryCode} {scoutDetails.phoneNumber}</span>
                        </div>
                      )}
                      {scoutDetails.clubName && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium text-white">{scoutDetails.clubName}</span>
                        </div>
                      )}
                      {(scoutDetails.city || scoutDetails.state || scoutDetails.country) && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {[scoutDetails.city, scoutDetails.state, scoutDetails.country, scoutDetails.pincode]
                              .filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Selections Section */}
              {scoutDetails.videoSelections && scoutDetails.videoSelections.length > 0 && (
                <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-zinc-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Selections ({scoutDetails.videoSelections.length})
                  </h3>
                  <div className="space-y-3">
                    {scoutDetails.videoSelections.map((selection: { id: string; status: string; createdAt: string; video?: { title?: string; playerProfile?: { user?: { name?: string } } } }) => (
                      <div key={selection.id} className="bg-zinc-800 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">
                              {selection.video?.playerProfile?.user?.name || 'Unknown Player'}
                            </p>
                            <p className="text-zinc-400 text-sm">
                              Status: <span className="capitalize">{selection.status?.toLowerCase()}</span>
                            </p>
                          </div>
                          <p className="text-zinc-400 text-sm">
                            {new Date(selection.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {selection.video?.title && (
                          <p className="text-zinc-300 text-sm">Video: {selection.video.title}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Info */}
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-4">Verification Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-zinc-400 text-sm">Status</span>
                    <div className="mt-1">{getStatusBadge(scoutDetails.verificationStatus)}</div>
                  </div>
                  {scoutDetails.verificationRemarks && (
                    <div>
                      <span className="text-zinc-400 text-sm">Remarks</span>
                      <p className="text-white mt-1">{scoutDetails.verificationRemarks}</p>
                    </div>
                  )}
                  {scoutDetails.verifiedAt && (
                    <div>
                      <span className="text-zinc-400 text-sm">Verified At</span>
                      <p className="text-white mt-1">
                        {new Date(scoutDetails.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {scoutDetails.createdAt && (
                    <div>
                      <span className="text-zinc-400 text-sm">Account Created</span>
                      <p className="text-white mt-1">
                        {new Date(scoutDetails.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedScout(scoutDetails);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Verify Scout
                </Button>
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    setScoutDetails(null);
                  }}
                  variant="outline"
                  className="flex-1 border-zinc-800 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Modal */}
        {selectedScout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Verify Scout</h2>
              <p className="text-zinc-400 mb-2">{selectedScout.name}</p>
              {selectedScout.clubName && (
                <p className="text-zinc-400 mb-4">Club: {selectedScout.clubName}</p>
              )}
              
              <div className="mb-4">
                <label className="block text-zinc-400 text-sm mb-2">Remarks (Optional)</label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add verification remarks..."
                  className="bg-zinc-900 border-zinc-800 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleVerification(selectedScout.id, 'VERIFIED')}
                  disabled={isVerifying}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Verified
                </Button>
                <Button
                  onClick={() => handleVerification(selectedScout.id, 'PENDING')}
                  disabled={isVerifying}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Mark as Pending
                </Button>
                <Button
                  onClick={() => handleVerification(selectedScout.id, 'REJECTED')}
                  disabled={isVerifying}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Rejected
                </Button>
                <Button
                  onClick={() => {
                    setSelectedScout(null);
                    setRemarks('');
                  }}
                  variant="outline"
                  className="w-full border-zinc-800 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

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

        {scouts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-zinc-400">No scouts found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function AdminScoutsPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </AppLayout>
    }>
      <AdminScoutsContent />
    </Suspense>
  );
}

