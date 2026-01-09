"use client";
import { useEffect, useState, Suspense } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PlayerMetrics {
  id?: string;
  playerProfileId?: string;
  speed: number;
  dribbling: number;
  passing: number;
  shooting: number;
  stamina: number;
  createdAt: string;
  distanceCovered?: number;
  topSpeed?: number;
  overallAccuracy?: number;
}

function LoadingFallback() {
  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-zinc-300">Loading analysis data...</div>
      </div>
    </AppLayout>
  );
}

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [metrics, setMetrics] = useState<PlayerMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const videoId = searchParams.get("videoId");
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

      try {
        if (videoId) {
          const token = localStorage.getItem("accessToken");
          if (!token) {
            throw new Error("Missing auth token");
          }

          const res = await axios.get(
            `${backendUrl}/api/videos/videos/${videoId}/analysis`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const dbMetrics = res.data?.metrics;
          if (dbMetrics) {
            setMetrics({
              id: dbMetrics.id,
              playerProfileId: dbMetrics.playerProfileId,
              speed: dbMetrics.speed,
              dribbling: dbMetrics.dribbling,
              passing: dbMetrics.passing,
              shooting: dbMetrics.shooting,
              stamina: dbMetrics.stamina,
              createdAt: dbMetrics.createdAt,
              // distanceCovered, topSpeed, overallAccuracy can be added later
            });
            setLoading(false);
            return;
          }
        }

        // Fallback: localStorage metrics (from immediate analysis flow)
        const storedMetrics =
          typeof window !== "undefined"
            ? localStorage.getItem("playerMetrics")
            : null;
        if (storedMetrics) {
          setMetrics(JSON.parse(storedMetrics));
        } else {
          setMetrics(null);
        }
      } catch (error) {
        console.error("Failed to load analysis data", error);
        toast.error("Failed to load analysis data");
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Helper function to safely format numbers
  const safeFormatNumber = (
    value: number | undefined | null,
    decimals: number = 1
  ): string => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0.0";
    }
    return value.toFixed(decimals);
  };

  if (loading) {
    return <LoadingFallback />;
  }

  if (!metrics) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-white">
              No Analysis Data Found
            </h2>
            <p className="text-zinc-400">
              Please upload a match video to generate performance metrics.
            </p>
            <Button
              onClick={() => router.push("/upload")}
              className="bg-red-600 hover:bg-red-700 text-white mt-2"
            >
              Upload Match Video
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Ensure all metrics have default values to prevent undefined errors
  const safeMetrics = {
    speed: metrics.speed ?? 0,
    dribbling: metrics.dribbling ?? 0,
    passing: metrics.passing ?? 0,
    shooting: metrics.shooting ?? 0,
    stamina: metrics.stamina ?? 0,
    distanceCovered: metrics.distanceCovered ?? 0,
    topSpeed: metrics.topSpeed ?? 0,
    overallAccuracy: metrics.overallAccuracy ?? 0,
    createdAt: metrics.createdAt ?? new Date().toISOString(),
  };

  // Compute overall rating from raw metrics (purely presentation, still based on real stats)
  const overallRaw =
    (safeMetrics.speed +
      safeMetrics.dribbling * 10 +
      safeMetrics.passing * 10 +
      safeMetrics.shooting * 10 +
      safeMetrics.stamina +
      safeMetrics.distanceCovered / 10) / 5;

  const overallClamped = Math.max(
    0,
    Math.min(100, isNaN(overallRaw) ? 0 : overallRaw)
  );

  const overallRating = 70 + (overallClamped / 100) * 10;

  // Prepare data for radar chart (all from real metrics)
  const radarData = [
    {
      attribute: "Speed",
      value: Math.max(0, safeMetrics.speed - 40),
    },
    {
      attribute: "Dribbling",
      value: safeMetrics.dribbling * 10,
    },
    {
      attribute: "Passing",
      value: safeMetrics.passing * 10,
    },
    {
      attribute: "Shooting",
      value: safeMetrics.shooting * 10,
    },
    {
      attribute: "Stamina",
      value: safeMetrics.stamina,
    },
  ];

  const barData = [
    { name: "Speed", value: Math.max(0, safeMetrics.speed - 40) },
    { name: "Dribbling", value: safeMetrics.dribbling * 10 },
    { name: "Passing", value: safeMetrics.passing * 10 },
    { name: "Shooting", value: safeMetrics.shooting * 10 },
    { name: "Stamina", value: safeMetrics.stamina },
    { name: "Distance (m)", value: safeMetrics.distanceCovered },
  ];

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 lg:py-8">
        {/* Header row with back button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              Player Performance Analysis
            </h1>
            <p className="text-zinc-400 text-sm lg:text-base">
              Based on AI analysis of your latest uploaded match video on{" "}
              <span className="text-zinc-200 font-medium">
                {new Date(safeMetrics.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-zinc-700 text-zinc-200 hover:bg-red-600 hover:border-red-600 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Top summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-600/20 via-red-500/10 to-zinc-900 border border-red-500/30 rounded-xl p-4 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-red-300 mb-1">
              Overall Rating
            </p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-white">
                {safeFormatNumber(overallRating, 1)}
              </span>
              <span className="text-xs text-zinc-400">
                Calculated from all core attributes
              </span>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
              Top Speed
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-lime-400">
                {safeFormatNumber(safeMetrics.topSpeed)}
              </span>
              <span className="text-sm text-zinc-400">km/h</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Peak sprint speed detected from video tracking.
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
              Distance Covered
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-sky-400">
                {safeFormatNumber(safeMetrics.distanceCovered)}
              </span>
              <span className="text-sm text-zinc-400">meters</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Total pitch coverage during the analyzed clip.
            </p>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Attribute Radar
              </h2>
              <span className="text-xs text-zinc-500">
                Higher area = stronger profile
              </span>
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
                  <Legend />
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

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Attribute Breakdown
              </h2>
              <span className="text-xs text-zinc-500">
                Relative strength across each category
              </span>
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

        {/* KPI cards */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Key Performance Indicators
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-400 mb-1">Speed</p>
              <p className="text-2xl font-bold text-red-400 mb-1">
                {safeFormatNumber(safeMetrics.speed)}
              </p>
              <p className="text-[11px] text-zinc-500">
                Average movement speed across all tracked frames.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-400 mb-1">Dribbling</p>
              <p className="text-2xl font-bold text-emerald-400 mb-1">
                {safeFormatNumber(safeMetrics.dribbling)}
              </p>
              <p className="text-[11px] text-zinc-500">
                Detected successful dribble events with ball control.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-400 mb-1">Passing</p>
              <p className="text-2xl font-bold text-sky-400 mb-1">
                {safeFormatNumber(safeMetrics.passing)}
              </p>
              <p className="text-[11px] text-zinc-500">
                Number of successful pass events detected.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-400 mb-1">Shooting</p>
              <p className="text-2xl font-bold text-amber-400 mb-1">
                {safeFormatNumber(safeMetrics.shooting)}
              </p>
              <p className="text-[11px] text-zinc-500">
                Detected shot attempts towards goal area.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-400 mb-1">Stamina</p>
              <p className="text-2xl font-bold text-cyan-400 mb-1">
                {safeFormatNumber(safeMetrics.stamina)}
              </p>
              <p className="text-[11px] text-zinc-500">
                Derived from total distance covered in the clip.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-400 mb-1">Tracking Accuracy</p>
              <p className="text-2xl font-bold text-teal-300 mb-1">
                {safeFormatNumber(safeMetrics.overallAccuracy)}%
              </p>
              <p className="text-[11px] text-zinc-500">
                Percentage of frames where the player was successfully tracked.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-400 mb-1">Overall Score</p>
              <p className="text-2xl font-bold text-white mb-1">
                {safeFormatNumber(overallRating)}
              </p>
              <p className="text-[11px] text-zinc-500">
                Combined score summarizing your current performance profile.
              </p>
            </div>
          </div>
        </div>

        {/* Text summary */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">
            Analysis Summary
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            These insights are generated directly from your match video using
            our computer-vision tracking pipeline, combining player movement,
            ball interaction events, and overall activity across the pitch.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-white mb-1">Strengths</h3>
              <ul className="list-disc list-inside text-zinc-400 space-y-1">
                <li>
                  Strong work rate with{" "}
                  {safeFormatNumber(safeMetrics.distanceCovered)} m covered.
                </li>
                <li>
                  Good sprint capability with top speed of{" "}
                  {safeFormatNumber(safeMetrics.topSpeed)} km/h.
                </li>
                <li>Solid technical base across multiple attributes.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-1">
                Areas for Improvement
              </h3>
              <ul className="list-disc list-inside text-zinc-400 space-y-1">
                {safeMetrics.dribbling < 7 && (
                  <li>Increase one-vs-one dribbling and ball control.</li>
                )}
                {safeMetrics.passing < 7 && (
                  <li>Work on pass consistency and decision timing.</li>
                )}
                {safeMetrics.shooting < 7 && (
                  <li>Practice finishing in and around the penalty area.</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-1">
                Training Suggestions
              </h3>
              <ul className="list-disc list-inside text-zinc-400 space-y-1">
                <li>High-intensity interval runs to sustain stamina.</li>
                <li>Small-sided games to improve decision-making speed.</li>
                <li>Technical drills focusing on first touch and passing.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function PlayerAnalysis() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnalysisContent />
    </Suspense>
  );
}