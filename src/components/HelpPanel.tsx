"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/state/store";
import { useProfileStore } from "@/state/profileStore";
import { Digit } from "@/engine";

export function HelpPanel() {
  const dispatch = useGameStore((s) => s.dispatch);
  const config = useGameStore((s) => s.config);
  const profile = useProfileStore((s) => s.profile);
  const useHelpItem = useProfileStore((s) => s.useHelpItem);

  const candidateFilterInProgress = useGameStore(
    (s) => s.candidateFilterInProgress,
  );

  const [showDigitSelector, setShowDigitSelector] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Milestone O: Check quantities instead of ownership
  const filterQty =
    (profile.inventory.helpItems["candidate_filter"] || 0) +
    (profile.inventory.helpItems["candidate_filter_premium"] || 0);
  const cleanQty =
    (profile.inventory.helpItems["clean_notes"] || 0) +
    (profile.inventory.helpItems["clean_notes_premium"] || 0);

  const hasFilterItem = filterQty > 0;
  const hasCleanItem = cleanQty > 0;

  if (!config.helpEnabled) {
    return null; // Hide panel when help is disabled
  }

  const handleCandidateFilter = async (digit: Digit) => {
    // Milestone O: Use consumable item
    const itemId = profile.inventory.helpItems["candidate_filter_premium"]
      ? "candidate_filter_premium"
      : "candidate_filter";

    if (!useHelpItem(itemId)) {
      dispatch({
        type: "SET_TOAST",
        message: "No candidate filter items remaining!",
        toastType: "error",
      });
      return;
    }

    dispatch({ type: "START_CANDIDATE_FILTER" });
    setShowDigitSelector(false);

    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout")),
          config.candidateFilterTimeout,
        ),
      );

      // Create filter promise (simulated for now - actual implementation would filter candidates)
      const filterPromise = new Promise((resolve) => {
        // Simulate filtering work
        setTimeout(() => {
          dispatch({ type: "APPLY_CANDIDATE_FILTER", digit });
          resolve(true);
        }, 100);
      });

      // Race between filter and timeout
      await Promise.race([filterPromise, timeoutPromise]);

      dispatch({ type: "COMPLETE_CANDIDATE_FILTER" });
    } catch (error) {
      dispatch({ type: "COMPLETE_CANDIDATE_FILTER" });
      if (error instanceof Error && error.message === "Timeout") {
        dispatch({
          type: "SET_TOAST",
          message: "Candidate filtering timed out (10s limit)",
          toastType: "warning",
        });
      }
    }
  };

  const handleCleanNotes = () => {
    // Milestone O: Use consumable item
    const itemId = profile.inventory.helpItems["clean_notes_premium"]
      ? "clean_notes_premium"
      : "clean_notes";

    if (!useHelpItem(itemId)) {
      dispatch({
        type: "SET_TOAST",
        message: "No clean notes items remaining!",
        toastType: "error",
      });
      return;
    }

    dispatch({ type: "CLEAN_INVALID_NOTES" });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
        <span>🛠️</span>
        <span>Help Items</span>
      </h3>

      {/* Candidate Filter */}
      {isMounted && hasFilterItem && (
        <div className="mb-3">
          <button
            onClick={() => setShowDigitSelector(!showDigitSelector)}
            disabled={candidateFilterInProgress || filterQty === 0}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded font-semibold hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {candidateFilterInProgress ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Filtering...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Candidate Filter</span>
                </>
              )}
            </span>
            <span className="text-sm bg-purple-600 px-2 py-0.5 rounded">
              {filterQty}x
            </span>
          </button>
          {showDigitSelector && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleCandidateFilter(digit)}
                  disabled={candidateFilterInProgress}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold py-2 rounded transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
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
          disabled={cleanQty === 0}
          className="w-full bg-green-500 text-white py-2 px-4 rounded font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span>✨</span>
            <span>Clean Invalid Notes</span>
          </span>
          <span className="text-sm bg-green-600 px-2 py-0.5 rounded">
            {cleanQty}x
          </span>
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
