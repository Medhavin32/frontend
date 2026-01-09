/**
 * Production-grade Overall Rating Calculator
 * 
 * Normalizes all metrics to 0-1 scale and uses weighted contributions
 * based on football performance analysis.
 * 
 * Final rating ranges from 40-95 (FIFA-style rating scale)
 */

export interface PerformanceMetrics {
  speed: number;              // km/h (typical range: 15-35)
  stamina: number;            // 0-100 (already normalized)
  dribbling: number;          // 0-100 (already normalized)
  passing: number;            // 0-100 (already normalized)
  shooting: number;           // 0-100 (already normalized)
  agility?: number;           // 0-100 (optional)
  intelligence?: number;      // 0-100 (optional)
  distanceCovered?: number;   // meters (typical range: 3000-12000)
}

/**
 * Normalize a value to 0-1 range
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5; // Avoid division by zero
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Calculate overall rating from performance metrics
 * 
 * @param metrics - Performance metrics object
 * @returns Overall rating (40-95 range, FIFA-style)
 */
export function calculateOverallRating(metrics: PerformanceMetrics): number {
  // Normalize all metrics to 0-1 scale
  const speedN = normalize(metrics.speed, 15, 35); // km/h range
  const staminaN = normalize(metrics.stamina, 0, 100);
  const dribblingN = normalize(metrics.dribbling, 0, 100);
  const passingN = normalize(metrics.passing, 0, 100);
  const shootingN = normalize(metrics.shooting, 0, 100);
  const agilityN = normalize(metrics.agility ?? 50, 0, 100); // Default to 50 if missing
  const intelligenceN = normalize(metrics.intelligence ?? 50, 0, 100); // Default to 50 if missing
  const distanceN = metrics.distanceCovered 
    ? normalize(metrics.distanceCovered, 3000, 12000) // meters range
    : 0; // If not provided, assume 0

  // Football-based weighted contribution
  // All weights sum to 100%
  const weightedScore =
    speedN * 0.15 +           // 15% - Speed is important but not everything
    staminaN * 0.15 +          // 15% - Endurance matters
    distanceN * 0.10 +         // 10% - Distance covered (work rate)
    dribblingN * 0.15 +        // 15% - Technical skill
    passingN * 0.15 +          // 15% - Technical skill
    shootingN * 0.15 +         // 15% - Technical skill
    agilityN * 0.075 +         // 7.5% - Physical attribute
    intelligenceN * 0.075;     // 7.5% - Mental attribute

  // Scale to FIFA-style rating (40-95 range)
  // Base rating of 40, plus up to 55 points based on performance
  const footballRating = Math.round(40 + weightedScore * 55);

  // Ensure we stay within bounds (safety check)
  return Math.max(40, Math.min(95, footballRating));
}

