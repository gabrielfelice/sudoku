"use client";

import { useGameStore } from "@/state/store";
import { formatTime } from "@/lib/time";

export function TopBar() {
  const mistakes = useGameStore((s) => s.mistakes);
  const timer = useGameStore((s) => s.timer);
  const paused = useGameStore((s) => s.paused);
  const dispatch = useGameStore((s) => s.dispatch);

  const handlePause = () => {
    dispatch({ type: "TOGGLE_PAUSE" });
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-600">Erros:</span>
        <span className="text-lg font-bold text-red-600">{mistakes}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-600">Tempo:</span>
        <span className="text-lg font-bold text-gray-900 font-mono">
          {formatTime(timer.elapsedMs)}
        </span>
      </div>

      <button
        onClick={handlePause}
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        {paused ? "Retomar" : "Pausar"}
      </button>
    </div>
  );
}
