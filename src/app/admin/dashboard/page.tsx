"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  unverifiedPlayers: number;
  unverifiedScouts: number;
  totalPlayers: number;
  totalScouts: number;
  totalUnverified: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'players' | 'scouts'>('players');

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

    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.get(`${backendUrl}/api/admin/unverified`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading admin dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-zinc-400">Manage player and scout verifications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Unverified Players</span>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.unverifiedPlayers || 0}</p>
          </div>
          <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Unverified Scouts</span>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.unverifiedScouts || 0}</p>
          </div>
          <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Total Players</span>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalPlayers || 0}</p>
          </div>
          <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Total Scouts</span>
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalScouts || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 mb-6">
          <div className="flex gap-4 border-b border-zinc-800 pb-4 mb-6">
            <Button
              variant={activeTab === 'players' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('players')}
              className={
                activeTab === 'players'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }
            >
              <Users className="h-4 w-4 mr-2" />
              Players
            </Button>
            <Button
              variant={activeTab === 'scouts' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('scouts')}
              className={
                activeTab === 'scouts'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }
            >
              <Shield className="h-4 w-4 mr-2" />
              Scouts
            </Button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'players' ? (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Player Verifications</h2>
                <p className="text-zinc-400 mb-6">
                  Review and verify player accounts. Players must be verified before they can upload videos.
                </p>
                <Link href="/admin/players">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Manage Players →
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Scout Verifications</h2>
                <p className="text-zinc-400 mb-6">
                  Review and verify scout accounts. Scouts must be verified before they can view and select player videos.
                </p>
                <Link href="/admin/scouts">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Manage Scouts →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/players?status=PENDING">
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-red-600 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-white font-semibold">Pending Players</p>
                    <p className="text-zinc-400 text-sm">Review pending player verifications</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/admin/scouts?status=PENDING">
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-red-600 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-white font-semibold">Pending Scouts</p>
                    <p className="text-zinc-400 text-sm">Review pending scout verifications</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

