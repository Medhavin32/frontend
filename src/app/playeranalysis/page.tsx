"use client";
import { useEffect, useState } from "react";
import { 
  LineChart, 
  Line, 
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
  ResponsiveContainer 
} from 'recharts';

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

export default function PlayerAnalysis() {
  const [metrics, setMetrics] = useState<PlayerMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get metrics from localStorage
    const storedMetrics = localStorage.getItem('playerMetrics');
    if (storedMetrics) {
      setMetrics(JSON.parse(storedMetrics));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-white">Loading analysis data...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">No Analysis Data Found</h2>
          <p className="text-zinc-400">Please upload a video to generate performance metrics.</p>
        </div>
      </div>
    );
  }

  // Helper function to safely format numbers
  const safeFormatNumber = (value: number | undefined | null, decimals: number = 1): string => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0.0';
    }
    return value.toFixed(decimals);
  };

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
    createdAt: metrics.createdAt ?? new Date().toISOString()
  };

  // Compute overall rating from raw metrics
  const overallRaw =
    (safeMetrics.speed +
      safeMetrics.dribbling * 10 +
      safeMetrics.passing * 10 +
      safeMetrics.shooting * 10 +
      safeMetrics.stamina +
      safeMetrics.distanceCovered / 10) / 5;

  // Clamp raw rating to 0–100
  const overallClamped = Math.max(
    0,
    Math.min(100, isNaN(overallRaw) ? 0 : overallRaw)
  );

  // Map to display range 70–80
  const overallRating = 70 + (overallClamped / 100) * 10;

  // Prepare data for radar chart
  const radarData = [
    {
      name: 'Performance Metrics',
      speed: safeMetrics.speed - 40,
      dribbling: safeMetrics.dribbling * 10, // Scale to match other metrics
      passing: safeMetrics.passing * 10,
      shooting: safeMetrics.shooting * 10,
      stamina: safeMetrics.stamina,
      distance: safeMetrics.distanceCovered
    }
  ];

  // Prepare data for bar chart
  const barData = [
    { name: 'Speed', value: safeMetrics.speed - 40},
    { name: 'Dribbling', value: safeMetrics.dribbling * 10 },
    { name: 'Passing', value: safeMetrics.passing * 10 },
    { name: 'Shooting', value: safeMetrics.shooting * 10 },
    { name: 'Stamina', value: safeMetrics.stamina },
    { name: 'Distance', value: safeMetrics.distanceCovered }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Player Performance Analysis</h1>
          <p className="text-zinc-400">
            Based on video analysis completed on {new Date(safeMetrics.createdAt).toLocaleDateString()}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Performance Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid stroke="#444" />
                  <PolarAngleAxis dataKey="name" tick={false} />
                  <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={{ fill: '#888' }} />
                  <Radar
                    name="Performance Metrics"
                    dataKey="speed"
                    stroke="#ff4d4f"
                    fill="#ff4d4f"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Dribbling"
                    dataKey="dribbling"
                    stroke="#52c41a"
                    fill="#52c41a"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Passing"
                    dataKey="passing"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Shooting"
                    dataKey="shooting"
                    stroke="#faad14"
                    fill="#faad14"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Agility"
                    dataKey="agility"
                    stroke="#722ed1"
                    fill="#722ed1"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Stamina"
                    dataKey="stamina"
                    stroke="#13c2c2"
                    fill="#13c2c2"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Intelligence"
                    dataKey="intelligence"
                    stroke="#eb2f96"
                    fill="#eb2f96"
                    fillOpacity={0.3}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Performance Breakdown</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" tick={{ fill: '#888' }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#888' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#333', border: 'none' }}
                  />
                  <Bar dataKey="value" fill="#ff4d4f" name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold mb-4">Key Performance Indicators</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">
                {safeFormatNumber(safeMetrics.speed)}
              </div>
              <div className="text-zinc-400">Speed</div>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {safeFormatNumber(safeMetrics.dribbling)}
              </div>
              <div className="text-zinc-400">Dribbling</div>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {safeFormatNumber(safeMetrics.passing)}
              </div>
              <div className="text-zinc-400">Passing</div>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {safeFormatNumber(safeMetrics.shooting)}
              </div>
              <div className="text-zinc-400">Shooting</div>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-cyan-500 mb-2">
                {safeFormatNumber(safeMetrics.stamina)}
              </div>
              <div className="text-zinc-400">Stamina</div>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-lime-400 mb-2">
                {safeFormatNumber(safeMetrics.topSpeed)} km/h
              </div>
              <div className="text-zinc-400">Top Speed</div>
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {safeFormatNumber(safeMetrics.distanceCovered)} m
              </div>
              <div className="text-zinc-400">Distance Covered (m)</div>
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">
                {safeFormatNumber(safeMetrics.overallAccuracy)}%
              </div>
              <div className="text-zinc-400">Tracking Accuracy</div>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {safeFormatNumber(overallRating)}
              </div>
              <div className="text-zinc-400">Overall Rating</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Analysis Summary</h2>
          
          <p className="text-zinc-400 mb-4">
            Based on our AI analysis of your uploaded performance video, we've generated a comprehensive breakdown of your key footballing attributes.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-white">Strengths:</h3>
              <ul className="list-disc list-inside text-zinc-400 mt-2">
                <li>Excellent stamina level at {safeFormatNumber(safeMetrics.stamina)}</li>
                <li>Good speed at {safeFormatNumber(safeMetrics.speed)}</li>
                <li>Balanced technical skills across dribbling, passing, and shooting</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white">Areas for Improvement:</h3>
              <ul className="list-disc list-inside text-zinc-400 mt-2">
                {safeMetrics.dribbling < 7 && <li>Work on close ball control and dribbling techniques</li>}
                {safeMetrics.passing < 7 && <li>Improve passing accuracy and decision-making</li>}
                {safeMetrics.shooting < 7 && <li>Practice shooting precision and power</li>}
                {/* Additional improvement suggestions can be added here if needed */}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white">Training Recommendations:</h3>
              <ul className="list-disc list-inside text-zinc-400 mt-2">
                <li>Interval training to maintain excellent stamina levels</li>
                <li>Technical drills focusing on ball control and dribbling</li>
                <li>Shooting practice from various positions</li>
                <li>Small-sided games to improve decision-making</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}