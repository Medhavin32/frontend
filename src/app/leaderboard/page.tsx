"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Zap, 
  Target,
  User,
  Gauge,
  Activity
} from "lucide-react";
import Image from "next/image";

interface LeaderboardPlayer {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  position: string;
  club?: string;
  age: number;
  rank: number;
  overallAccuracy: number;
  speed: number;
  dribbling: number;
  passing: number;
  shooting: number;
  stamina: number;
  agility: number;
  totalVideos: number;
  lastUpdated: string;
}

type SortBy = 'accuracy' | 'speed' | 'dribbling' | 'passing' | 'shooting' | 'stamina';

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('accuracy');
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const loadLeaderboard = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/leaderboard`, {
        params: { sortBy, limit: 100 }
      });
      setLeaderboard(response.data.leaderboard);
      setTotalPlayers(response.data.totalPlayers);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="h-6 w-6 text-gray-400" />;
    } else if (rank === 3) {
      return <Award className="h-6 w-6 text-amber-600" />;
    }
    return <span className="text-zinc-400 font-bold text-lg">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/20 border-yellow-500";
    if (rank === 2) return "bg-gray-400/20 border-gray-400";
    if (rank === 3) return "bg-amber-600/20 border-amber-600";
    return "bg-zinc-900 border-zinc-800";
  };

  const sortOptions: { value: SortBy; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'accuracy', label: 'Overall Accuracy', icon: Target },
    { value: 'speed', label: 'Running Speed', icon: Zap },
    { value: 'dribbling', label: 'Dribbling Speed', icon: Activity },
    { value: 'passing', label: 'Passing', icon: TrendingUp },
    { value: 'shooting', label: 'Shooting', icon: Target },
    { value: 'stamina', label: 'Stamina', icon: Gauge },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white">Loading leaderboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Trophy className="h-10 w-10 text-yellow-500" />
                Leaderboard
              </h1>
              <p className="text-zinc-400">
                Top players ranked by performance metrics
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{totalPlayers}</p>
              <p className="text-zinc-400 text-sm">Total Players</p>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 mb-6">
          <div className="flex flex-wrap gap-3">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  className={
                    sortBy === option.value
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }
                  onClick={() => setSortBy(option.value)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No players found on the leaderboard yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Overall Accuracy
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Running Speed
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Dribbling Speed
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Videos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {leaderboard.map((player) => (
                    <tr
                      key={player.id}
                      className={`hover:bg-zinc-900/50 transition-colors ${getRankBadgeColor(player.rank)}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {getRankIcon(player.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-600">
                            <Image
                              src={player.profilePicture || '/default-avatar.png'}
                              alt={player.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <div className="text-white font-semibold">{player.name}</div>
                            <div className="text-zinc-400 text-sm">{player.club || 'No Club'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Target className="h-4 w-4 text-red-500" />
                          <span className="text-white font-semibold">
                            {player.overallAccuracy.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="text-white font-semibold">
                            {player.speed.toFixed(1)} km/h
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-white font-semibold">
                            {player.dribbling.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-zinc-300">{player.position}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-zinc-300">{player.totalVideos}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-zinc-400 text-sm">Overall Accuracy</p>
                <p className="text-white font-semibold">
                  Average of passing, dribbling, and shooting
                </p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-zinc-400 text-sm">Running Speed</p>
                <p className="text-white font-semibold">
                  Top speed achieved (km/h)
                </p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-zinc-400 text-sm">Dribbling Speed</p>
                <p className="text-white font-semibold">
                  Dribbling success rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

