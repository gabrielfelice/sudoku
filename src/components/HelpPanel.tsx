"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/state/store";
import { useProfileStore } from "@/state/profileStore";
import { Digit } from "@/engine";

export function HelpPanel() {
  const dispatch = useGameStore((s) => s.dispatch);
  const config = useGameStore((s) => s.config);
  const difficulty = useGameStore((s) => s.difficulty);
  const hintsUsedThisPuzzle = useGameStore((s) => s.hintsUsedThisPuzzle);
  const profile = useProfileStore((s) => s.profile);

  const [showDigitSelector, setShowDigitSelector] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasFilterItem =
    profile.inventory.helpItems.includes("candidate_filter") ||
    profile.inventory.helpItems.includes("candidate_filter_premium");
  const hasCleanItem =
    profile.inventory.helpItems.includes("clean_notes") ||
    profile.inventory.helpItems.includes("clean_notes_premium");

  if (!config.helpEnabled) {
    return null; // Hide panel when help is disabled
  }

  const handleCandidateFilter = (digit: Digit) => {
    dispatch({ type: "APPLY_CANDIDATE_FILTER", digit });
    setShowDigitSelector(false);
  };

  const handleCleanNotes = () => {
    dispatch({ type: "CLEAN_INVALID_NOTES" });
  };

  const hintLimit = difficulty === "expert" ? config.expertHintLimit : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
        <span>🛠️</span>
        <span>Help Items</span>
      </h3>

      {/* Hint Counter */}
      {hintLimit && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
          <div className="text-sm font-semibold text-blue-900">
            Hints Used: {hintsUsedThisPuzzle} / {hintLimit}
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(hintsUsedThisPuzzle / hintLimit) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Candidate Filter */}
      {isMounted && hasFilterItem && (
        <div className="mb-3">
          <button
            onClick={() => setShowDigitSelector(!showDigitSelector)}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded font-semibold hover:bg-purple-600 transition-colors"
          >
            🔍 Candidate Filter
          </button>
          {showDigitSelector && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleCandidateFilter(digit)}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold py-2 rounded transition-colors"
                >
                  {digit}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clean Invalid Notes */}
      {isMounted && hasCleanItem && (
        <button
          onClick={handleCleanNotes}
          className="w-full bg-green-500 text-white py-2 px-4 rounded font-semibold hover:bg-green-600 transition-colors"
        >
          ✨ Clean Invalid Notes
        </button>
      )}

      {/* No Items Message */}
      {isMounted && !hasFilterItem && !hasCleanItem && (
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">No help items owned.</p>
          <p className="text-xs mt-1">Visit the shop to purchase items!</p>
        </div>
      )}
    </div>
  );
}
