"use client";

import { useState } from "react";
import { useProfileStore } from "@/state/profileStore";
import { DifficultyStats } from "@/lib/profile";

export function LearningCurve() {
  const profile = useProfileStore((s) => s.profile);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard" | "expert"
  >("medium");

  const stats = profile.stats[selectedDifficulty];

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTrend = (
    history: Array<{
      date: number;
      avgTime?: number;
      avgErrors?: number;
      avgHints?: number;
    }>,
  ): string => {
    if (history.length < 2) return "—";
    const first = history[0];
    const last = history[history.length - 1];

    const firstValue = first.avgTime ?? first.avgErrors ?? first.avgHints ?? 0;
    const lastValue = last.avgTime ?? last.avgErrors ?? last.avgHints ?? 0;

    if (lastValue < firstValue) return "↓ Improving";
    if (lastValue > firstValue) return "↑ Getting harder";
    return "→ Stable";
  };

  const renderSimpleChart = (
    data: Array<{ date: number; value: number }>,
    label: string,
    color: string,
  ) => {
    if (data.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          No data yet. Play more games to see your progress!
        </div>
      );
    }

    const max = Math.max(...data.map((d) => d.value));
    const min = Math.min(...data.map((d) => d.value));
    const range = max - min || 1;

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Oldest</span>
          <span>Latest</span>
        </div>
        <div className="flex items-end gap-1 h-32 border-b border-l border-gray-300 pl-2 pb-2">
          {data.map((point, idx) => {
            const height = ((point.value - min) / range) * 100;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col justify-end group relative"
              >
                <div
                  className={`${color} rounded-t transition-all hover:opacity-80`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {label === "Time"
                    ? formatTime(point.value)
                    : point.value.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            Min: {label === "Time" ? formatTime(min) : min.toFixed(1)}
          </span>
          <span>
            Max: {label === "Time" ? formatTime(max) : max.toFixed(1)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Learning Curve</h2>
        <p className="text-gray-600">Track your improvement over time</p>
      </div>

      {/* Difficulty Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Select Difficulty
        </label>
        <div className="flex gap-2">
          {(["easy", "medium", "hard", "expert"] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-4 py-2 rounded font-semibold capitalize ${
                selectedDifficulty === diff
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Games Completed</div>
          <div className="text-3xl font-bold">{stats.gamesCompleted}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Best Time</div>
          <div className="text-3xl font-bold">
            {stats.bestTimeMs ? formatTime(stats.bestTimeMs) : "—"}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Avg Mistakes</div>
          <div className="text-3xl font-bold">
            {stats.avgMistakes.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-8">
        {/* Time Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">⏱️ Time Trend</h3>
            <span className="text-sm font-semibold text-blue-600">
              {getTrend(stats.timeHistory)}
            </span>
          </div>
          {renderSimpleChart(
            stats.timeHistory.map((h) => ({ date: h.date, value: h.avgTime })),
            "Time",
            "bg-blue-500",
          )}
        </div>

        {/* Error Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">❌ Error Trend</h3>
            <span className="text-sm font-semibold text-red-600">
              {getTrend(stats.errorHistory)}
            </span>
          </div>
          {renderSimpleChart(
            stats.errorHistory.map((h) => ({
              date: h.date,
              value: h.avgErrors,
            })),
            "Errors",
            "bg-red-500",
          )}
        </div>

        {/* Hint Usage Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">💡 Hint Usage Trend</h3>
            <span className="text-sm font-semibold text-yellow-600">
              {getTrend(stats.hintHistory)}
            </span>
          </div>
          {renderSimpleChart(
            stats.hintHistory.map((h) => ({ date: h.date, value: h.avgHints })),
            "Hints",
            "bg-yellow-500",
          )}
        </div>
      </div>
    </div>
  );
}
