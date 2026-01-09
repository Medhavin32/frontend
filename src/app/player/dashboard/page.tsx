"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { 
  Video, 
  Eye, 
  CheckCircle2, 
  Star, 
  TrendingUp,
  Calendar,
  User,
  Award,
  MessageSquare,
  XCircle,
  X,
  BarChart3,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { calculateOverallRating } from "@/lib/calculateOverallRating";

interface VideoSelection {
  id: string;
  scout: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    phoneNumber?: string;
    countryCode?: string;
    city?: string;
    state?: string;
    country?: string;
    clubName?: string;
    verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED';
  };
  status: 'VIEWED' | 'INTERESTED' | 'SELECTED' | 'REJECTED';
  clubName?: string;
  comments?: string;
  selectedAt?: string;
  createdAt: string;
}

interface VideoData {
  id: string;
  videoUrl: string;
  googleDriveFileId?: string;
  status: string;
  createdAt: string;
  selections: VideoSelection[];
  hasSelections: boolean;
  isSelected: boolean;
}

interface PlayerMetrics {
  id?: string;
  playerProfileId?: string;
  speed: number;
  dribbling: number;
  passing: number;
  shooting: number;
  agility?: number;
  stamina: number;
  intelligence?: number;
  distanceCovered?: number;
  createdAt: string;
}

export default function PlayerDashboard() {
  const router = useRouter();
  interface DashboardData {
    player: {
      name: string;
      profilePicture?: string;
    };
    statistics: {
      totalVideos: number;
      analyzedVideos: number;
      selectedVideos: number;
      totalViews: number;
    };
    videos: VideoData[];
  }

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [analysisVideoId, setAnalysisVideoId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<PlayerMetrics | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Helper function to convert Google Drive view link to embed URL
  const getEmbedUrl = (videoUrl: string, googleDriveFileId?: string) => {
    // Use googleDriveFileId if available (more reliable)
    if (googleDriveFileId) {
      return `https://drive.google.com/file/d/${googleDriveFileId}/preview`;
    }
    // Fallback: Extract from URL
    if (!videoUrl) return null;
    const match = videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return videoUrl;
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadDashboard = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.get(`${backendUrl}/api/player/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error('Player profile not found. Please complete your profile first.');
        router.push('/playerprofile');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalysisData = async (videoId: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    if (!token) {
      toast.error('Please login to view analysis');
      return;
    }

    setLoadingAnalysis(true);
    try {
      const response = await axios.get(`${backendUrl}/api/videos/videos/${videoId}/analysis`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const dbMetrics = response.data?.metrics;
      if (dbMetrics) {
        setAnalysisData({
          id: dbMetrics.id,
          playerProfileId: dbMetrics.playerProfileId,
          speed: dbMetrics.speed ?? 0,
          dribbling: dbMetrics.dribbling ?? 0,
          passing: dbMetrics.passing ?? 0,
          shooting: dbMetrics.shooting ?? 0,
          agility: dbMetrics.agility ?? 0,
          stamina: dbMetrics.stamina ?? 0,
          intelligence: dbMetrics.intelligence ?? 0,
          createdAt: dbMetrics.createdAt,
        });
        setAnalysisVideoId(videoId);
      } else {
        toast.error('No analysis data available for this video');
        setAnalysisData(null);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error('Analysis not found for this video');
      } else {
        toast.error('Failed to load video analysis');
      }
      setAnalysisData(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const safeFormatNumber = (
    value: number | undefined | null,
    decimals: number = 1
  ): string => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0.0";
    }
    return value.toFixed(decimals);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
      'SELECTED': { color: 'bg-green-500/20 text-green-400', icon: CheckCircle2, label: 'Selected' },
      'INTERESTED': { color: 'bg-yellow-500/20 text-yellow-400', icon: Star, label: 'Interested' },
      'VIEWED': { color: 'bg-blue-500/20 text-blue-400', icon: Eye, label: 'Viewed' },
      'REJECTED': { color: 'bg-red-500/20 text-red-400', icon: XCircle, label: 'Rejected' }
    };
    const badge = badges[status] || badges['VIEWED'];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  if (!dashboardData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-red-400">Failed to load dashboard data</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full border-2 border-red-600 bg-zinc-800 flex items-center justify-center overflow-hidden">
              {/* {dashboardData.player.profilePicture ? (
                <Image
                  src={dashboardData.player.profilePicture}
                  alt={dashboardData.player.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-zinc-400" />
              )} */}
              <User className="h-8 w-8 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Player Dashboard</h1>
              <p className="text-zinc-400">Welcome back, {dashboardData.player.name}</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Total Videos</p>
                <p className="text-2xl font-bold text-white">{dashboardData.statistics.totalVideos}</p>
              </div>
              <Video className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Analyzed</p>
                <p className="text-2xl font-bold text-white">{dashboardData.statistics.analyzedVideos}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Selected</p>
                <p className="text-2xl font-bold text-white">{dashboardData.statistics.selectedVideos}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Total Views</p>
                <p className="text-2xl font-bold text-white">{dashboardData.statistics.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-2xl font-bold text-white mb-6">Your Videos</h2>
          
          {dashboardData.videos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No videos uploaded yet</p>
              <button
                onClick={() => router.push('/upload')}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Upload Your First Video
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.videos.map((video: VideoData) => {
                const embedUrl = getEmbedUrl(video.videoUrl, video.googleDriveFileId);
                const isExpanded = expandedVideoId === video.id;

                return (
                  <div
                    key={video.id}
                    className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:border-red-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Video className="h-5 w-5 text-red-500" />
                          <h3 className="text-lg font-semibold text-white">
                            Video {new Date(video.createdAt).toLocaleDateString()}
                          </h3>
                          {video.isSelected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Selected by Scout
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(video.createdAt).toLocaleDateString()}
                          </span>
                          <span className="capitalize">{video.status.toLowerCase()}</span>
                          {video.hasSelections && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {video.selections.length} scout{video.selections.length !== 1 ? 's' : ''} viewed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadAnalysisData(video.id);
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                        >
                          View Analysis
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedVideoId(isExpanded ? null : video.id);
                          }}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm"
                        >
                          {isExpanded ? 'Hide Video' : 'View Video'}
                        </button>
                      </div>
                    </div>

                    {/* Embedded Video Player */}
                    {isExpanded && embedUrl && (
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

                    {/* Scout Selections */}
                    {video.selections.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        <h4 className="text-sm font-semibold text-zinc-300 mb-3">Scout Interactions</h4>
                        <div className="space-y-3">
                          {video.selections.map((selection: VideoSelection) => (
                            <div
                              key={selection.id}
                              className={`bg-zinc-950 rounded-lg p-4 border ${
                                selection.status === 'SELECTED' 
                                  ? 'border-green-500/30 bg-green-500/5' 
                                  : 'border-zinc-800'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                {/* Scout Profile Picture */}
                                <div className="relative w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {selection.scout.profilePicture ? (
                                    <Image
                                      src={selection.scout.profilePicture}
                                      alt={selection.scout.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <User className="h-6 w-6 text-zinc-400" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  {/* Scout Name and Status */}
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-white font-medium">{selection.scout.name}</span>
                                    {getStatusBadge(selection.status)}
                                    {selection.scout.verificationStatus === 'VERIFIED' && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Verified Scout
                                      </span>
                                    )}
                                  </div>

                                  {/* Scout Basic Info - Show especially for SELECTED/INTERESTED status */}
                                  {(selection.status === 'SELECTED' || selection.status === 'INTERESTED') && (
                                    <div className="mt-3 space-y-1.5 text-sm">
                                      {/* Email */}
                                      <div className="flex items-center gap-2 text-zinc-400">
                                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{selection.scout.email}</span>
                                      </div>

                                      {/* Phone */}
                                      {selection.scout.phoneNumber && (
                                        <div className="flex items-center gap-2 text-zinc-400">
                                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                          <span>
                                            {selection.scout.countryCode ? `${selection.scout.countryCode} ` : ''}
                                            {selection.scout.phoneNumber}
                                          </span>
                                        </div>
                                      )}

                                      {/* Location */}
                                      {(selection.scout.city || selection.scout.state || selection.scout.country) && (
                                        <div className="flex items-center gap-2 text-zinc-400">
                                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                          <span>
                                            {[
                                              selection.scout.city,
                                              selection.scout.state,
                                              selection.scout.country
                                            ].filter(Boolean).join(', ')}
                                          </span>
                                        </div>
                                      )}

                                      {/* Club Name - from scout profile or selection */}
                                      {(selection.scout.clubName || selection.clubName) && (
                                        <div className="flex items-center gap-2 text-zinc-400">
                                          <Award className="h-3.5 w-3.5 flex-shrink-0" />
                                          <span>Club: {selection.scout.clubName || selection.clubName}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Comments */}
                                  {selection.comments && (
                                    <div className="mt-3 pt-3 border-t border-zinc-800">
                                      <p className="text-sm text-zinc-300 flex items-start gap-2">
                                        <MessageSquare className="h-4 w-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                                        <span>{selection.comments}</span>
                                      </p>
                                    </div>
                                  )}

                                  {/* Selected Date */}
                                  {selection.selectedAt && (
                                    <p className="text-xs text-zinc-500 mt-2">
                                      Selected on {new Date(selection.selectedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Modal */}
      {analysisVideoId && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setAnalysisVideoId(null);
            setAnalysisData(null);
          }}
        >
          <div 
            className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-red-500" />
                Video Analysis
              </h2>
              <button
                onClick={() => {
                  setAnalysisVideoId(null);
                  setAnalysisData(null);
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            <div className="p-6">
              {loadingAnalysis ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-white">Loading analysis data...</div>
                </div>
              ) : analysisData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-red-600/20 via-red-500/10 to-zinc-900 border border-red-500/30 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide text-red-300 mb-1">
                        Overall Rating
                      </p>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-extrabold text-white">
                          {safeFormatNumber(
                            calculateOverallRating({
                              speed: analysisData.speed,
                              stamina: analysisData.stamina,
                              dribbling: analysisData.dribbling,
                              passing: analysisData.passing,
                              shooting: analysisData.shooting,
                              agility: analysisData.agility,
                              intelligence: analysisData.intelligence,
                              distanceCovered: analysisData.distanceCovered
                            })
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
                        Speed
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-lime-400">
                          {safeFormatNumber(analysisData.speed)}
                        </span>
                        <span className="text-sm text-zinc-400">km/h avg</span>
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
                        Stamina
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-cyan-400">
                          {safeFormatNumber(analysisData.stamina)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  {(() => {
                    const radarData = [
                      {
                        attribute: "Speed",
                        value: Math.max(0, analysisData.speed - 40),
                      },
                      {
                        attribute: "Dribbling",
                        value: analysisData.dribbling * 10,
                      },
                      {
                        attribute: "Passing",
                        value: analysisData.passing * 10,
                      },
                      {
                        attribute: "Shooting",
                        value: analysisData.shooting * 10,
                      },
                      {
                        attribute: "Stamina",
                        value: analysisData.stamina,
                      },
                    ];

                    const barData = [
                      { name: "Speed", value: Math.max(0, analysisData.speed - 40) },
                      { name: "Dribbling", value: analysisData.dribbling * 10 },
                      { name: "Passing", value: analysisData.passing * 10 },
                      { name: "Shooting", value: analysisData.shooting * 10 },
                      { name: "Stamina", value: analysisData.stamina },
                    ];

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">
                              Attribute Radar
                            </h3>
                          </div>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart outerRadius={95} data={radarData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis
                                  dataKey="attribute"
                                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                />
                                <PolarRadiusAxis
                                  domain={[0, 100]}
                                  axisLine={false}
                                  tick={{ fill: "#71717a", fontSize: 10 }}
                                />
                                <Radar
                                  name="Score"
                                  dataKey="value"
                                  stroke="#f97373"
                                  fill="#ef4444"
                                  fillOpacity={0.3}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#18181b",
                                    border: "1px solid #27272a",
                                    borderRadius: "0.5rem",
                                  }}
                                  labelStyle={{ color: "#e4e4e7" }}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">
                              Attribute Breakdown
                            </h3>
                          </div>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={barData}
                                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                />
                                <YAxis
                                  domain={[0, 100]}
                                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#18181b",
                                    border: "1px solid #27272a",
                                    borderRadius: "0.5rem",
                                  }}
                                  labelStyle={{ color: "#e4e4e7" }}
                                />
                                <Bar
                                  dataKey="value"
                                  fill="url(#barGradient)"
                                  radius={[6, 6, 0, 0]}
                                />
                                <defs>
                                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.95} />
                                    <stop offset="100%" stopColor="#7f1d1d" stopOpacity={0.6} />
                                  </linearGradient>
                                </defs>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Metrics Grid */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Performance Metrics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 mb-1">Speed</p>
                        <p className="text-2xl font-bold text-red-400 mb-1">
                          {safeFormatNumber(analysisData.speed)}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Average movement speed
                        </p>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 mb-1">Dribbling</p>
                        <p className="text-2xl font-bold text-emerald-400 mb-1">
                          {safeFormatNumber(analysisData.dribbling)}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Ball control events
                        </p>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 mb-1">Passing</p>
                        <p className="text-2xl font-bold text-sky-400 mb-1">
                          {safeFormatNumber(analysisData.passing)}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Successful passes
                        </p>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 mb-1">Shooting</p>
                        <p className="text-2xl font-bold text-amber-400 mb-1">
                          {safeFormatNumber(analysisData.shooting)}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Shot attempts
                        </p>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 mb-1">Stamina</p>
                        <p className="text-2xl font-bold text-cyan-400 mb-1">
                          {safeFormatNumber(analysisData.stamina)}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Endurance rating
                        </p>
                      </div>

                      {analysisData.agility !== undefined && analysisData.agility > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                          <p className="text-xs text-zinc-400 mb-1">Agility</p>
                          <p className="text-2xl font-bold text-purple-400 mb-1">
                            {safeFormatNumber(analysisData.agility)}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Quickness & agility
                          </p>
                        </div>
                      )}

                      {analysisData.intelligence !== undefined && analysisData.intelligence > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                          <p className="text-xs text-zinc-400 mb-1">Intelligence</p>
                          <p className="text-2xl font-bold text-indigo-400 mb-1">
                            {safeFormatNumber(analysisData.intelligence)}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Decision making
                          </p>
                        </div>
                      )}

                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 mb-1">Analysis Date</p>
                        <p className="text-sm font-medium text-white mb-1">
                          {new Date(analysisData.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          When analysis was generated
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Analysis Summary
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4">
                      Performance insights generated from AI analysis of your match video, 
                      tracking player movement, ball interactions, and overall activity.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-white mb-2">Key Strengths</h4>
                        <ul className="list-disc list-inside text-zinc-400 space-y-1">
                          {analysisData.speed > 50 && (
                            <li>Strong speed with {safeFormatNumber(analysisData.speed)} km/h average</li>
                          )}
                          {analysisData.dribbling > 7 && (
                            <li>Good dribbling ability ({safeFormatNumber(analysisData.dribbling)}/10)</li>
                          )}
                          {analysisData.stamina > 60 && (
                            <li>Solid stamina and endurance</li>
                          )}
                          {(!analysisData.speed || analysisData.speed <= 50) && 
                           (!analysisData.dribbling || analysisData.dribbling <= 7) && 
                           (!analysisData.stamina || analysisData.stamina <= 60) && (
                            <li>Continue working on all aspects of your game</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-2">Areas to Improve</h4>
                        <ul className="list-disc list-inside text-zinc-400 space-y-1">
                          {analysisData.dribbling < 7 && (
                            <li>Work on ball control and dribbling skills</li>
                          )}
                          {analysisData.passing < 7 && (
                            <li>Improve passing accuracy and decision making</li>
                          )}
                          {analysisData.shooting < 7 && (
                            <li>Practice finishing in goal-scoring situations</li>
                          )}
                          {analysisData.speed < 50 && (
                            <li>Focus on speed and acceleration training</li>
                          )}
                          {analysisData.dribbling >= 7 && analysisData.passing >= 7 && analysisData.shooting >= 7 && (
                            <li>Maintain your current skill level and continue improvement</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No analysis data available for this video</p>
                  <p className="text-zinc-500 text-sm mt-2">
                    The video may still be processing or analysis has not been generated yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

