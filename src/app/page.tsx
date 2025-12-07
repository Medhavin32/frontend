"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Timer from "@/components/features/Timer";
import { Button } from "@/components/ui/button";
import UploadForm from "@/components/upload/UploadForm";
import PlayerCard from "@/components/features/PlayerCard";
import { CircularProgress } from "@/components/ui/circular-progress";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and their role
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        const role = userData.role?.toLowerCase();
        
        // Redirect scouts to scout dashboard
        if (role === 'scout') {
          router.push('/scout/dashboard');
        }
      } catch (error) {
        // If parsing fails, continue to show home page
        console.error('Error parsing user data:', error);
      }
    }
  }, [router]);

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="relative w-full rounded-xl overflow-hidden bg-zinc-950 mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"></div>

          <div className="relative z-10 px-6 py-8 md:px-10 md:py-12 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="mb-4">
                <Timer />
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Transforming <span className="text-red-500">Footage</span> into Future<br />
                
              </h1>

              <p className="text-white/80 text-lg mb-6">
                AI Player Detection & Tracking<br />
                <span className="text-zinc-400">Advanced Performance Breakdown</span>
              </p>

            </div>

            <div className="w-full md:w-2/5">
              <div className="aspect-[3/4] relative bg-zinc-900 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/image.jpeg"
                    alt="Soccer Player"
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        

        {/* AI Performance Breakdown */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 uppercase">AI Player Performance Breakdown</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlayerCard
              type="breakdown"
              title="AI PLAYER PERFORMANCE BREAKDOWN"
              imageUrl="/player1.png"
            />

            <div className="bg-zinc-950 rounded-xl p-6 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4">Player Performance</h3>

              <div className="flex-1 flex flex-col items-center justify-center">
                <CircularProgress
                  value={91}
                  size={160}
                  strokeWidth={10}
                  label="91"
                  className="mb-6"
                />

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-xs text-zinc-400">Total Distance</p>
                    <p className="text-lg font-bold text-white">8.2 km</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Sprint Count</p>
                    <p className="text-lg font-bold text-white">24</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Top Speed</p>
                    <p className="text-lg font-bold text-white">32 km/h</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Passes</p>
                    <p className="text-lg font-bold text-white">42</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-xl p-6 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4">AI-Generated Player Report</h3>

              <div className="flex-1 flex flex-col items-center justify-center">
                <CircularProgress
                  value={99}
                  size={160}
                  strokeWidth={10}
                  primaryColor="#ef4444"
                  secondaryColor="#000"
                  label="99"
                  className="mb-6"
                />

                <div className="space-y-4 w-full">
                  <div className="bg-zinc-900 p-4 rounded-lg">
                    <div className="text-xs text-zinc-400 mb-1">Overall Rating</div>
                    <div className="text-xl font-bold text-white">Excellent</div>
                  </div>

                  <div className="bg-zinc-900 p-4 rounded-lg">
                    <div className="text-xs text-zinc-400 mb-1">Performance Summary</div>
                    <div className="text-sm text-white">Strong positional awareness and excellent decision making on the field.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/upload"
            className="bg-zinc-950 p-5 rounded-xl hover:bg-zinc-900 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">UPLOAD</h3>
                <p className="text-sm text-zinc-400">Upload match videos</p>
              </div>
            </div>
         </Link>

          <Link
            href="/features"
            className="bg-zinc-950 p-5 rounded-xl hover:bg-zinc-900 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">FEATURES</h3>
                <p className="text-sm text-zinc-400">Explore all features</p>
              </div>
            </div>
          </Link>

          <Link
            href="/contact"
            className="bg-zinc-950 p-5 rounded-xl hover:bg-zinc-900 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">CONTACT</h3>
                <p className="text-sm text-zinc-400">Get in touch with us</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
