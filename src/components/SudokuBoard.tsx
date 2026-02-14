"use client";

import { SudokuCell } from "./SudokuCell";

export function SudokuBoard() {
  return (
    <div
      className="inline-grid grid-cols-9 gap-0 border-4 border-gray-400"
      role="grid"
      aria-label="Sudoku board"
    >
      {Array.from({ length: 81 }, (_, idx) => {
        const row = Math.floor(idx / 9);
        const col = idx % 9;

        // Add thicker borders for block boundaries
        let borderClass = "";
        if (col === 2 || col === 5)
          borderClass += " border-r-2 border-r-gray-400";
        if (row === 2 || row === 5)
          borderClass += " border-b-2 border-b-gray-400";

        return (
          <div key={idx} className={borderClass}>
            <SudokuCell idx={idx} />
          </div>
        );
      })}
    </div>
  );
}
