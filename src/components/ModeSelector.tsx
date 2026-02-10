"use client";

import { useState } from "react";
import { PlayMode } from "@/state/types";

interface ModeSelectorProps {
  onSelectMode: (mode: PlayMode) => void;
  onClose: () => void;
}

export function ModeSelector({ onSelectMode, onClose }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<PlayMode>("normal");

  const handleConfirm = () => {
    onSelectMode(selectedMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <h2 className="text-3xl font-bold mb-4">Select Game Mode</h2>
        <p className="text-gray-600 mb-6">
          Choose how you want to play your next puzzle
        </p>

        <div className="space-y-4 mb-6">
          {/* Normal Mode */}
          <button
            onClick={() => setSelectedMode("normal")}
            className={`w-full text-left border-2 rounded-lg p-4 transition-all ${
              selectedMode === "normal"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">🎯</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Normal Mode</h3>
                <p className="text-sm text-gray-600">
                  Standard Sudoku gameplay with timer, error tracking, and
                  hints. Your stats will be recorded normally.
                </p>
              </div>
              {selectedMode === "normal" && (
                <div className="text-blue-500 text-2xl">✓</div>
              )}
            </div>
          </button>

          {/* Zen Mode */}
          <button
            onClick={() => setSelectedMode("zen")}
            className={`w-full text-left border-2 rounded-lg p-4 transition-all ${
              selectedMode === "zen"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">🧘</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Zen Mode</h3>
                <p className="text-sm text-gray-600">
                  Relaxed gameplay with no timer and no error counter. Perfect
                  for learning and stress-free solving. Stats recorded
                  separately.
                </p>
              </div>
              {selectedMode === "zen" && (
                <div className="text-purple-500 text-2xl">✓</div>
              )}
            </div>
          </button>

          {/* Challenge Mode */}
          <button
            onClick={() => setSelectedMode("challenge")}
            className={`w-full text-left border-2 rounded-lg p-4 transition-all ${
              selectedMode === "challenge"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">⚡</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Challenge Mode</h3>
                <p className="text-sm text-gray-600">
                  Hardcore mode with strict time limits, error limits, and
                  reduced hints. Test your skills! Stats recorded separately.
                </p>
                <div className="mt-2 text-xs text-red-600 font-semibold">
                  ⚠️ Time Limit: 20 min | Max Errors: 3 | Max Hints: 1
                </div>
              </div>
              {selectedMode === "challenge" && (
                <div className="text-red-500 text-2xl">✓</div>
              )}
            </div>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
