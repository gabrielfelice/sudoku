/**
 * Local telemetry utilities for tracking player statistics
 * No external tracking - all data stays local
 */

export interface TelemetryStats {
  avgTimeBetweenActions: number; // milliseconds
  errorRate: number; // percentage
  hintUsageRate: number; // hints per game
  totalActions: number;
  totalErrors: number;
  totalHints: number;
}

/**
 * Calculate statistics from telemetry data
 */
export function calculateTelemetryStats(
  actionTimestamps: number[],
  errorCount: number,
  hintCount: number,
): TelemetryStats {
  const totalActions = actionTimestamps.length;

  // Calculate average time between actions
  let avgTimeBetweenActions = 0;
  if (actionTimestamps.length > 1) {
    const intervals: number[] = [];
    for (let i = 1; i < actionTimestamps.length; i++) {
      intervals.push(actionTimestamps[i] - actionTimestamps[i - 1]);
    }
    avgTimeBetweenActions =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  // Calculate error rate
  const errorRate = totalActions > 0 ? (errorCount / totalActions) * 100 : 0;

  // Hint usage rate (per game, assuming 81 cells)
  const hintUsageRate = hintCount;

  return {
    avgTimeBetweenActions,
    errorRate,
    hintUsageRate,
    totalActions,
    totalErrors: errorCount,
    totalHints: hintCount,
  };
}

/**
 * Format time duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}min`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Get performance rating based on stats
 */
export function getPerformanceRating(stats: TelemetryStats): {
  rating: "excellent" | "good" | "average" | "needs-improvement";
  message: string;
} {
  const { errorRate, avgTimeBetweenActions, hintUsageRate } = stats;

  // Lower error rate and moderate pace is better
  if (errorRate < 5 && avgTimeBetweenActions > 2000 && hintUsageRate < 3) {
    return {
      rating: "excellent",
      message: "Excelente! Você está jogando com precisão e estratégia.",
    };
  }

  if (errorRate < 10 && avgTimeBetweenActions > 1000 && hintUsageRate < 5) {
    return {
      rating: "good",
      message: "Bom trabalho! Continue praticando para melhorar ainda mais.",
    };
  }

  if (errorRate < 20 && hintUsageRate < 10) {
    return {
      rating: "average",
      message: "Você está progredindo. Tente pensar mais antes de cada jogada.",
    };
  }

  return {
    rating: "needs-improvement",
    message: "Continue praticando! Use as dicas para aprender novas técnicas.",
  };
}
