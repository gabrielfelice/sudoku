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
  const config = useGameStore((s) => s.config);
  const dispatch = useGameStore((s) => s.dispatch);

  const cellValue = values[idx];
  const cellMeta = meta[idx];
  const isSelected = selectedIdx === idx;
  const hint = useGameStore((s) => s.hint);

  // Determine if this cell is a peer of the selected cell
  const isPeer =
    selectedIdx !== null &&
    selectedIdx !== idx &&
    getPeers(selectedIdx).includes(idx);

  // Determine if this cell is highlighted by a hint
  const isHintPrimary = hint?.visible && hint.highlight.primary.includes(idx);
  const isHintSecondary =
    hint?.visible && hint.highlight.secondary.includes(idx);

  // Determine if this cell has the same number as the selected cell
  const selectedValue = selectedIdx !== null ? values[selectedIdx] : 0;
  const isSameNumber =
    config.showSameNumberHighlight &&
    cellValue !== 0 &&
    cellValue === selectedValue;

  // Determine if notes should be highlighted (bold)
  const highlightedNoteDigit: Digit | null =
    selectedIdx !== null && values[selectedIdx] !== 0
      ? (values[selectedIdx] as Digit)
      : null;

  const handleClick = () => {
    dispatch({ type: "SELECT_CELL", idx });
  };

  // Cell background color using CSS variables
  let bgStyle: React.CSSProperties = {};
  if (isHintPrimary) {
    bgStyle.backgroundColor = "var(--hint-primary-bg)";
  } else if (isHintSecondary) {
    bgStyle.backgroundColor = "var(--hint-secondary-bg)";
  } else if (isSelected) {
    bgStyle.backgroundColor = "var(--selected-cell-bg)";
  } else if (isPeer && config.showPeerHighlight) {
    bgStyle.backgroundColor = "var(--peer-cell-bg)";
  }

  // Number color using CSS variables
  let textStyle: React.CSSProperties = {};
  if (cellMeta.isGiven) {
    textStyle.color = "var(--given-number-color)";
    textStyle.fontWeight = "bold";
  } else if (cellMeta.status === "correct") {
    textStyle.color = "var(--correct-number-color)";
    textStyle.fontWeight = "600";
  } else if (cellMeta.status === "wrong") {
    textStyle.color = "var(--wrong-number-color)";
    textStyle.fontWeight = "600";
  }

  // Ring/border for same number using CSS variable
  let ringStyle: React.CSSProperties = {};
  if (isSameNumber) {
    ringStyle.outline = "2px solid var(--same-number-outline)";
    ringStyle.outlineOffset = "-2px";
  }

  // Mode-specific border styling when selected
  if (isSelected) {
    if (mode === "note") {
      ringStyle.outline = "4px solid #10b981";
      ringStyle.outlineOffset = "-4px";
    } else if (mode === "inspect") {
      ringStyle.outline = "4px solid #f59e0b";
      ringStyle.outlineOffset = "-4px";
    } else {
      ringStyle.outline = "4px solid #3b82f6";
      ringStyle.outlineOffset = "-4px";
    }
  }

  const combinedStyle = { ...bgStyle, ...ringStyle };

  return (
    <button
      onClick={handleClick}
      style={combinedStyle}
      className="w-12 h-12 border border-gray-300 flex items-center justify-center relative hover:bg-blue-100 transition-colors focus:outline-none"
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
        <span className="text-2xl" style={textStyle}>
          {cellValue}
        </span>
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
