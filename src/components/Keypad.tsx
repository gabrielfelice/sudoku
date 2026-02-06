"use client";

import { useGameStore } from "@/state/store";
import { Digit, DIGITS } from "@/engine";

export function Keypad() {
  const dispatch = useGameStore((s) => s.dispatch);
  const selectedIdx = useGameStore((s) => s.selectedIdx);
  const mode = useGameStore((s) => s.mode);
  const paused = useGameStore((s) => s.paused);
  const values = useGameStore((s) => s.values);
  const meta = useGameStore((s) => s.meta);

  const handleDigitClick = (digit: Digit) => {
    if (paused || mode === "inspect" || selectedIdx === null) return;
    dispatch({ type: "INPUT_DIGIT", digit });
  };

  // Count how many times each digit appears (givens + answers)
  const digitCounts: Record<Digit, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  };

  values.forEach((val, idx) => {
    if (val !== 0) {
      digitCounts[val as Digit]++;
    }
  });

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {DIGITS.map((digit) => {
        const isComplete = digitCounts[digit] >= 9;
        const isDisabled =
          paused || mode === "inspect" || selectedIdx === null || isComplete;

        if (isComplete) return null; // Hide completed digits

        return (
          <button
            key={digit}
            onClick={() => handleDigitClick(digit)}
            disabled={isDisabled}
            className="w-14 h-14 bg-blue-600 text-white text-2xl font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {digit}
          </button>
        );
      })}
    </div>
  );
}
