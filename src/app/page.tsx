"use client";

import { useEffect } from "react";
import { useGameStore } from "@/state/store";
import { CellValue } from "@/engine";
import { TopBar } from "@/components/TopBar";
import { SudokuBoard } from "@/components/SudokuBoard";
import { ActionBar } from "@/components/ActionBar";
import { Keypad } from "@/components/Keypad";
import { PauseOverlay } from "@/components/PauseOverlay";
import { EASY_PUZZLE, parsePuzzle } from "@/lib/puzzles";

export default function HomePage() {
  const dispatch = useGameStore((s) => s.dispatch);
  const paused = useGameStore((s) => s.paused);

  // Initialize puzzle on mount
  useEffect(() => {
    const given = parsePuzzle(EASY_PUZZLE.given) as CellValue[];
    const solution = parsePuzzle(EASY_PUZZLE.solution) as CellValue[];
    dispatch({ type: "INIT_PUZZLE", given, solution });
  }, [dispatch]);

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER", now: Date.now() });
    }, 250);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full">
        <TopBar />

        <div className="p-6 flex flex-col items-center gap-6 relative">
          {paused && <PauseOverlay />}

          <SudokuBoard />
          <ActionBar />
          <Keypad />
        </div>
      </div>
    </div>
  );
}
