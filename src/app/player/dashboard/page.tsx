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
  XCircle
} from "lucide-react";
import Image from "next/image";

interface VideoSelection {
  id: string;
  scout: {
    id: string;
    name: string;
    email: string;
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
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm"
                        >
                          View Video
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedVideoId(isExpanded ? null : video.id);
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                        >
                          {isExpanded ? 'Hide Player' : 'View Analysis'}
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
                              className="bg-zinc-950 rounded-lg p-4 border border-zinc-800"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-zinc-400" />
                                    <span className="text-white font-medium">{selection.scout.name}</span>
                                    {getStatusBadge(selection.status)}
                                  </div>
                                  {selection.clubName && (
                                    <p className="text-sm text-zinc-400 mb-1">
                                      <Award className="h-3 w-3 inline mr-1" />
                                      Club: {selection.clubName}
                                    </p>
                                  )}
                                  {selection.comments && (
                                    <p className="text-sm text-zinc-300 mt-2 flex items-start gap-2">
                                      <MessageSquare className="h-4 w-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                                      <span>{selection.comments}</span>
                                    </p>
                                  )}
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
    </AppLayout>
  );
}

