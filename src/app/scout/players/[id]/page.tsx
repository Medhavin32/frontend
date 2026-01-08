"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, Mail, Phone, MapPin, Calendar, Award, 
  CheckCircle2, XCircle, AlertCircle, Video, BarChart3 
} from "lucide-react";
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
  documentNumber?: string;
  documentPhotos?: string[];
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verificationRemarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  playerProfile?: {
    id: string;
    age: number;
    position: string;
    club?: string;
    nationality?: string;
    performanceMetrics?: Array<{
      id: string;
      speed: number;
      dribbling: number;
      passing: number;
      shooting: number;
      stamina: number;
      createdAt: string;
    }>;
    uploadedVideos?: Array<{
      id: string;
      videoUrl: string;
      googleDriveFileId?: string;
      status: string;
      createdAt: string;
      performanceMetrics?: Array<{
        id: string;
        speed: number;
        dribbling: number;
        passing: number;
        shooting: number;
        stamina: number;
        createdAt: string;
      }>;
    }>;
    scoutReports?: Array<{
      id: string;
      rating: number;
      comments?: string;
      createdAt: string;
      scout: {
        name: string;
        email: string;
      };
    }>;
  };
}

export default function PlayerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.id as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnverified, setIsUnverified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [verificationRemarks, setVerificationRemarks] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isUpdatingSelection, setIsUpdatingSelection] = useState(false);

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

    fetchPlayerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, playerId]);

  const fetchPlayerDetails = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.get(`${backendUrl}/api/scout/players/${playerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setPlayer(response.data);
      setIsUnverified(false); // Reset unverified state on success
    } catch (error: unknown) {
      console.error('Failed to fetch player details:', error);
      
      // Check if scout is not verified
      if (axios.isAxiosError(error) && error.response?.status === 403 && error.response?.data?.error === 'Scout not verified') {
        setIsUnverified(true);
        setVerificationStatus(error.response.data.verificationStatus || 'PENDING');
        setVerificationRemarks(error.response.data.verificationRemarks || '');
        toast.error(error.response.data.message || 'You are not verified by admin');
      } else {
        toast.error('Failed to load player details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Note: Verification functionality has been moved to admin dashboard
  // Scouts can only view player details and select videos

  const getVideoMetrics = (videoId: string) => {
    const v = player?.playerProfile?.uploadedVideos?.find((vid) => vid.id === videoId);
    const m = v?.performanceMetrics?.[0];
    return m || null;
  };

  // Helper function to convert Google Drive view link to embed URL
  const getEmbedUrl = (videoUrl: string, googleDriveFileId?: string) => {
    // Use googleDriveFileId if available (more reliable)
    if (googleDriveFileId) {
      return `https://drive.google.com/file/d/${googleDriveFileId}/preview`;
    }
    // Fallback: Extract from URL
    if (!videoUrl) return null;
    // Extract file ID from Google Drive URL
    // Format: https://drive.google.com/file/d/FILE_ID/view
    const match = videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return videoUrl; // Fallback to original URL
  };

  const updateVideoSelection = async (
    videoId: string,
    status: "SELECTED" | "REJECTED"
  ) => {
    try {
      setIsUpdatingSelection(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You must be logged in as a scout to update selections.");
        return;
      }

      await axios.post(
        `${backendUrl}/api/scout/videos/${videoId}/select`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        status === "SELECTED"
          ? "Video marked as SELECTED for this player."
          : "Video marked as REJECTED."
      );

      await fetchPlayerDetails();
      setIsVideoModalOpen(false);
      setSelectedVideoId(null);
    } catch (error) {
      console.error("Failed to update video selection:", error);
      toast.error("Failed to update video selection");
    } finally {
      setIsUpdatingSelection(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Verified</span>
          </div>
        );
      case 'PENDING':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Pending</span>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full">
            <XCircle className="h-5 w-5" />
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
          <div className="text-white">Loading player details...</div>
        </div>
      </AppLayout>
    );
  }

  // Show unverified message if scout is not verified
  if (isUnverified) {
    return (
      <AppLayout>
        <div className="w-full max-w-4xl mx-auto py-8">
          <Button
            onClick={() => router.push('/scout/dashboard')}
            variant="outline"
            className="mb-6 border-zinc-800 text-white hover:bg-zinc-900"
          >
            ← Back to Dashboard
          </Button>
          
          <div className="bg-zinc-950 rounded-xl p-8 border border-zinc-800">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Verification Required</h1>
              <p className="text-zinc-400 text-lg mb-6">
                You are not verified by admin. Please wait for admin verification to access player details and videos.
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

  if (!player) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Player not found</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto py-8">
        <Button
          onClick={() => router.push('/scout/dashboard')}
          variant="outline"
          className="mb-6 border-zinc-800 text-white hover:bg-zinc-900"
        >
          ← Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Player Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-6">Personal Details</h2>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="relative w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {player.profilePicture ? (
                    <Image
                      src={player.profilePicture}
                      alt={player.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-zinc-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{player.name}</h3>
                  {getStatusBadge(player.verificationStatus)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Mail className="h-5 w-5" />
                  <span>{player.email}</span>
                </div>
                {player.phoneNumber && (
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Phone className="h-5 w-5" />
                    <span>{player.countryCode} {player.phoneNumber}</span>
                  </div>
                )}
                {(player.city || player.state || player.country) && (
                  <div className="flex items-center gap-3 text-zinc-400">
                    <MapPin className="h-5 w-5" />
                    <span>
                      {[player.city, player.state, player.country, player.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {player.documentNumber && (
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Award className="h-5 w-5" />
                    <span>Document: {player.documentNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Player Profile */}
            {player.playerProfile && (
              <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
                <h2 className="text-2xl font-bold text-white mb-6">Player Profile</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-400">Position</span>
                    <p className="text-white font-semibold">{player.playerProfile.position}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Age</span>
                    <p className="text-white font-semibold">{player.playerProfile.age}</p>
                  </div>
                  {player.playerProfile.club && (
                    <div>
                      <span className="text-zinc-400">Club</span>
                      <p className="text-white font-semibold">{player.playerProfile.club}</p>
                    </div>
                  )}
                  {player.playerProfile.nationality && (
                    <div>
                      <span className="text-zinc-400">Nationality</span>
                      <p className="text-white font-semibold">{player.playerProfile.nationality}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {player.playerProfile?.performanceMetrics && player.playerProfile.performanceMetrics.length > 0 && (
              <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Performance Metrics
                </h2>
                {player.playerProfile.performanceMetrics.map((metric, index) => (
                  <div key={metric.id} className={index > 0 ? "mt-4 pt-4 border-t border-zinc-800" : ""}>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <span className="text-zinc-400 text-sm">Speed</span>
                        <p className="text-white font-semibold">{metric.speed.toFixed(1)}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-sm">Dribbling</span>
                        <p className="text-white font-semibold">{metric.dribbling.toFixed(1)}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-sm">Passing</span>
                        <p className="text-white font-semibold">{metric.passing.toFixed(1)}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-sm">Shooting</span>
                        <p className="text-white font-semibold">{metric.shooting.toFixed(1)}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-sm">Stamina</span>
                        <p className="text-white font-semibold">{metric.stamina.toFixed(1)}</p>
                      </div>
                    </div>
                    <p className="text-zinc-500 text-xs mt-2">
                      Recorded: {new Date(metric.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Videos */}
            {player.playerProfile?.uploadedVideos &&
              player.playerProfile.uploadedVideos.length > 0 && (
                <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Video className="h-6 w-6" />
                    Uploaded Videos
                  </h2>
                  <div className="space-y-3">
                    {player.playerProfile.uploadedVideos.map((video) => (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => {
                          setSelectedVideoId(video.id);
                          setIsVideoModalOpen(true);
                        }}
                        className="w-full text-left bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-red-500 hover:bg-zinc-900/80 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">
                              Video {video.id.slice(0, 8)}
                            </p>
                            <p className="text-zinc-400 text-sm">
                              {new Date(video.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded text-xs ${
                              video.status === "ANALYZED"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {video.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Right Column - Video Selection Info */}
          <div className="space-y-6">
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
              <h2 className="text-xl font-bold text-white mb-4">Video Selection</h2>
              <p className="text-zinc-400 text-sm mb-4">
                As a scout, you can view player videos and mark them as interested or selected.
                Player account verification is handled by administrators.
              </p>
              {player.playerProfile?.uploadedVideos && player.playerProfile.uploadedVideos.length > 0 && (
                <div className="mt-4">
                  <p className="text-white font-semibold mb-2">
                    {player.playerProfile.uploadedVideos.length} video{player.playerProfile.uploadedVideos.length !== 1 ? 's' : ''} available
                  </p>
                  <p className="text-zinc-400 text-sm">
                    Click on videos above to view and select them.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Video stats + selection modal */}
      {isVideoModalOpen && selectedVideoId && (() => {
        const selectedVideo = player?.playerProfile?.uploadedVideos?.find(
          (vid) => vid.id === selectedVideoId
        );
        const metric = getVideoMetrics(selectedVideoId);
        const embedUrl = selectedVideo?.videoUrl 
          ? getEmbedUrl(selectedVideo.videoUrl, selectedVideo.googleDriveFileId) 
          : null;

        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Stats & Selection
              </h2>

              {/* Embedded Video Player */}
              {embedUrl && (
                <div className="mb-4 rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="400"
                    allow="autoplay"
                    frameBorder="0"
                    className="w-full"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Video Metrics */}
              {metric ? (
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-zinc-400">Speed</p>
                    <p className="text-white font-semibold">
                      {metric.speed.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Dribbling</p>
                    <p className="text-white font-semibold">
                      {metric.dribbling.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Passing</p>
                    <p className="text-white font-semibold">
                      {metric.passing.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Shooting</p>
                    <p className="text-white font-semibold">
                      {metric.shooting.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Stamina</p>
                    <p className="text-white font-semibold">
                      {metric.stamina.toFixed(1)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-zinc-500 text-xs">
                      Recorded:{" "}
                      {new Date(metric.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-400 text-sm mb-4">
                  No detailed metrics found for this video yet. Make sure
                  analysis has been run.
                </p>
              )}

              <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    setSelectedVideoId(null);
                  }}
                  className="border-zinc-700 text-zinc-200 hover:bg-zinc-900"
                >
                  Close
                </Button>
                <div className="flex gap-2">
                  {selectedVideo?.videoUrl && (
                    <a
                      href={selectedVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm inline-flex items-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Open in Google Drive
                    </a>
                  )}
                  <Button
                    disabled={isUpdatingSelection}
                    onClick={() =>
                      selectedVideoId &&
                      updateVideoSelection(selectedVideoId, "REJECTED")
                    }
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Mark Rejected
                  </Button>
                  <Button
                    disabled={isUpdatingSelection}
                    onClick={() =>
                      selectedVideoId &&
                      updateVideoSelection(selectedVideoId, "SELECTED")
                    }
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Mark Selected
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </AppLayout>
  );
}

