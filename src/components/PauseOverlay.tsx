"use client";

import { useGameStore } from "@/state/store";

export function PauseOverlay() {
  const paused = useGameStore((state) => state.paused);

  if (!paused) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-900/95 backdrop-blur-md select-none">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">⏸️</div>
        <h2 className="text-3xl font-bold text-white mb-2">Jogo Pausado</h2>
        <p className="text-gray-300">Clique em Continuar para retomar</p>
      </div>

      {/* Prevent inspect mode during pause */}
      <style jsx>{`
        .absolute {
          pointer-events: all;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>
    </div>
  );
}
