"use client";

import { useGameStore } from "@/state/store";
import { Digit, hasNote, getNotesArray } from "@/engine";
import { getPeers } from "@/engine/peers";

interface SudokuCellProps {
  idx: number;
}

export function SudokuCell({ idx }: SudokuCellProps) {
  const values = useGameStore((s) => s.values);
  const meta = useGameStore((s) => s.meta);
  const selectedIdx = useGameStore((s) => s.selectedIdx);
  const mode = useGameStore((s) => s.mode);
  const dispatch = useGameStore((s) => s.dispatch);

  const cellValue = values[idx];
  const cellMeta = meta[idx];
  const isSelected = selectedIdx === idx;

  // Determine if this cell is a peer of the selected cell
  const isPeer =
    selectedIdx !== null &&
    selectedIdx !== idx &&
    getPeers(selectedIdx).includes(idx);

  // Determine if this cell has the same number as the selected cell
  const selectedValue = selectedIdx !== null ? values[selectedIdx] : 0;
  const isSameNumber = cellValue !== 0 && cellValue === selectedValue;

  // Determine if notes should be highlighted (bold)
  const highlightedNoteDigit: Digit | null =
    selectedIdx !== null && values[selectedIdx] !== 0
      ? (values[selectedIdx] as Digit)
      : null;

  const handleClick = () => {
    dispatch({ type: "SELECT_CELL", idx });
  };

  // Cell background color
  let bgColor = "bg-white";
  if (isSelected) {
    bgColor = "bg-blue-200";
  } else if (isPeer) {
    bgColor = "bg-blue-50";
  }

  // Number color
  let textColor = "text-black";
  if (cellMeta.isGiven) {
    textColor = "text-black font-bold";
  } else if (cellMeta.status === "correct") {
    textColor = "text-blue-600 font-semibold";
  } else if (cellMeta.status === "wrong") {
    textColor = "text-red-600 font-semibold";
  }

  // Ring/border for same number
  let ringClass = isSameNumber ? "ring-2 ring-purple-500" : "";

  // Mode-specific border styling when selected
  if (isSelected) {
    if (mode === "note") {
      ringClass = "ring-4 ring-green-500";
    } else if (mode === "inspect") {
      ringClass = "ring-4 ring-yellow-500";
    } else {
      ringClass = "ring-4 ring-blue-500";
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        w-12 h-12 border border-gray-300 flex items-center justify-center relative
        ${bgColor} ${ringClass}
        hover:bg-blue-100 transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-400
      `}
      aria-label={`Cell ${idx + 1}, ${cellValue !== 0 ? `value ${cellValue}` : "empty"}`}
      role="gridcell"
    >
      {/* Locked indicator */}
      {cellMeta.isLocked && !cellMeta.isGiven && (
        <div
          className="absolute top-0.5 right-0.5 text-[8px] text-blue-400 opacity-60"
          title="Célula travada (resposta correta)"
        >
          🔒
        </div>
      )}

      {cellValue !== 0 ? (
        <span className={`text-2xl ${textColor}`}>{cellValue}</span>
      ) : (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
            const digit = d as Digit;
            const isPresent = hasNote(cellMeta.notes, digit);
            const isBold = highlightedNoteDigit === digit && isPresent;
            return (
              <div
                key={d}
                className="flex items-center justify-center text-[8px] text-gray-500"
              >
                {isPresent && (
                  <span className={isBold ? "font-bold text-purple-700" : ""}>
                    {d}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </button>
  );
}
