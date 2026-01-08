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
  Shield, Calendar, Award, Video, BarChart3, FileText
} from "lucide-react";
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
  pincode?: string;
  profilePicture?: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verificationRemarks?: string;
  verifiedAt?: string;
  playerProfile?: {
    age: number;
    position: string;
    club?: string;
    nationality?: string;
    performanceMetrics?: Array<{
      topSpeed?: string;
      distanceCovered?: string;
      passAccuracy?: number;
      overallRating?: number;
    }>;
    uploadedVideos?: Array<{
      id: string;
      title?: string;
      videoUrl: string;
      googleDriveFileId?: string;
      createdAt: string;
    }>;
    scoutReports?: Array<{
      id: string;
      notes?: string;
      createdAt: string;
      scout?: {
        name?: string;
        clubName?: string;
      };
    }>;
  };
}

function AdminPlayersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerDetails, setPlayerDetails] = useState<Player | null>(null);
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

    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, filterStatus, pagination.page]);

  const fetchPlayers = async () => {
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

      const response = await axios.get(`${backendUrl}/api/admin/players`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params
      });

      setPlayers(response.data.players || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Failed to fetch players:', error);
      toast.error('Failed to load players');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlayerDetails = async (playerId: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    setIsLoadingDetails(true);
    try {
      const response = await axios.get(`${backendUrl}/api/admin/players/${playerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPlayerDetails(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to fetch player details:', error);
      toast.error('Failed to load player details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleVerification = async (playerId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    setIsVerifying(true);
    try {
      await axios.put(
        `${backendUrl}/api/admin/players/${playerId}/verify`,
        { status, remarks: remarks || undefined },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      toast.success(`Player marked as ${status}`);
      setSelectedPlayer(null);
      setShowDetails(false);
      setPlayerDetails(null);
      setRemarks('');
      fetchPlayers();
    } catch (error) {
      console.error('Failed to verify player:', error);
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
          <div className="text-white">Loading players...</div>
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
            <h1 className="text-3xl font-bold text-white">Player Verifications</h1>
          </div>
          <p className="text-zinc-400">Review and verify player accounts</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-zinc-950 rounded-xl p-6 mb-6 border border-zinc-800">
          <form onSubmit={(e) => { e.preventDefault(); setPagination(prev => ({ ...prev, page: 1 })); fetchPlayers(); }} className="flex gap-4 mb-4">
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

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <div
              key={player.id}
              onClick={() => fetchPlayerDetails(player.id)}
              className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-red-600 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {/* {player.profilePicture ? (
                      <Image
                        src={player.profilePicture}
                        alt={player.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-zinc-400" />
                    )} */}
                    <User className="h-8 w-8 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{player.name}</h3>
                    {getStatusBadge(player.verificationStatus)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
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
                {player.playerProfile && (
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <div className="text-zinc-400 text-sm">
                      <span className="font-medium text-white">Position:</span> {player.playerProfile.position}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlayer(player);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Verify Player
              </Button>
            </div>
          ))}
        </div>

        {/* Player Details Modal */}
        {showDetails && playerDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Player Details</h2>
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    setPlayerDetails(null);
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
                    {playerDetails.profilePicture ? (
                      <Image
                        src={playerDetails.profilePicture}
                        alt={playerDetails.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{playerDetails.name}</h3>
                    {getStatusBadge(playerDetails.verificationStatus)}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Mail className="h-4 w-4" />
                        <span>{playerDetails.email}</span>
                      </div>
                      {playerDetails.phoneNumber && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Phone className="h-4 w-4" />
                          <span>{playerDetails.countryCode} {playerDetails.phoneNumber}</span>
                        </div>
                      )}
                      {(playerDetails.city || playerDetails.state || playerDetails.country) && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {[playerDetails.city, playerDetails.state, playerDetails.country, playerDetails.pincode]
                              .filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Profile Section */}
              {playerDetails.playerProfile && (
                <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-zinc-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Player Profile
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-zinc-400 text-sm">Age</span>
                      <p className="text-white font-semibold">{playerDetails.playerProfile.age || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-sm">Position</span>
                      <p className="text-white font-semibold">{playerDetails.playerProfile.position || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-sm">Club</span>
                      <p className="text-white font-semibold">{playerDetails.playerProfile.club || 'N/A'}</p>
                    </div>
                    {playerDetails.playerProfile.nationality && (
                      <div>
                        <span className="text-zinc-400 text-sm">Nationality</span>
                        <p className="text-white font-semibold">{playerDetails.playerProfile.nationality}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Performance Metrics Section */}
              {playerDetails.playerProfile?.performanceMetrics && playerDetails.playerProfile.performanceMetrics.length > 0 && (
                <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-zinc-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Latest Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {playerDetails.playerProfile.performanceMetrics[0] && (
                      <>
                        <div>
                          <span className="text-zinc-400 text-sm">Top Speed</span>
                          <p className="text-white font-semibold">
                            {playerDetails.playerProfile.performanceMetrics[0].topSpeed || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-zinc-400 text-sm">Distance Covered</span>
                          <p className="text-white font-semibold">
                            {playerDetails.playerProfile.performanceMetrics[0].distanceCovered || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-zinc-400 text-sm">Pass Accuracy</span>
                          <p className="text-white font-semibold">
                            {playerDetails.playerProfile.performanceMetrics[0].passAccuracy || 'N/A'}%
                          </p>
                        </div>
                        <div>
                          <span className="text-zinc-400 text-sm">Overall Rating</span>
                          <p className="text-white font-semibold">
                            {playerDetails.playerProfile.performanceMetrics[0].overallRating || 'N/A'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Videos Section */}
              {playerDetails.playerProfile?.uploadedVideos && playerDetails.playerProfile.uploadedVideos.length > 0 && (
                <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-zinc-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Uploaded Videos ({playerDetails.playerProfile.uploadedVideos.length})
                  </h3>
                  <div className="space-y-2">
                    {playerDetails.playerProfile.uploadedVideos.map((video: { id: string; title?: string; videoUrl: string; createdAt: string }) => (
                      <div key={video.id} className="bg-zinc-800 rounded p-3 flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{video.title || 'Untitled Video'}</p>
                          <p className="text-zinc-400 text-sm">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:text-red-400"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scout Reports Section */}
              {playerDetails.playerProfile?.scoutReports && playerDetails.playerProfile.scoutReports.length > 0 && (
                <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-zinc-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Scout Reports ({playerDetails.playerProfile.scoutReports.length})
                  </h3>
                  <div className="space-y-3">
                    {playerDetails.playerProfile.scoutReports.map((report: { id: string; notes?: string; createdAt: string; scout?: { name?: string; clubName?: string } }) => (
                      <div key={report.id} className="bg-zinc-800 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium">
                            By: {report.scout?.name || 'Unknown Scout'}
                            {report.scout?.clubName && ` (${report.scout.clubName})`}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {report.notes && (
                          <p className="text-zinc-300 text-sm">{report.notes}</p>
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
                    <div className="mt-1">{getStatusBadge(playerDetails.verificationStatus)}</div>
                  </div>
                  {playerDetails.verificationRemarks && (
                    <div>
                      <span className="text-zinc-400 text-sm">Remarks</span>
                      <p className="text-white mt-1">{playerDetails.verificationRemarks}</p>
                    </div>
                  )}
                  {playerDetails.verifiedAt && (
                    <div>
                      <span className="text-zinc-400 text-sm">Verified At</span>
                      <p className="text-white mt-1">
                        {new Date(playerDetails.verifiedAt).toLocaleString()}
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
                    setSelectedPlayer(playerDetails);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Verify Player
                </Button>
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    setPlayerDetails(null);
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
        {selectedPlayer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Verify Player</h2>
              <p className="text-zinc-400 mb-4">{selectedPlayer.name}</p>
              
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
                  onClick={() => handleVerification(selectedPlayer.id, 'VERIFIED')}
                  disabled={isVerifying}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Verified
                </Button>
                <Button
                  onClick={() => handleVerification(selectedPlayer.id, 'PENDING')}
                  disabled={isVerifying}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Mark as Pending
                </Button>
                <Button
                  onClick={() => handleVerification(selectedPlayer.id, 'REJECTED')}
                  disabled={isVerifying}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Rejected
                </Button>
                <Button
                  onClick={() => {
                    setSelectedPlayer(null);
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

        {players.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-zinc-400">No players found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function AdminPlayersPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </AppLayout>
    }>
      <AdminPlayersContent />
    </Suspense>
  );
}

