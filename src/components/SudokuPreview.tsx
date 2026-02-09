"use client";

import React, { useEffect, useRef } from "react";
import { PlayerConfig, ThemeConfig } from "@/state/types";
import { Digit, hasNote } from "@/engine";

interface SudokuPreviewProps {
  theme: ThemeConfig;
  config: PlayerConfig;
}

/**
 * Non-playable Sudoku preview for customization screen
 * Shows example cells with various states to demonstrate theme and config
 */
export function SudokuPreview({ theme, config }: SudokuPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply theme as scoped CSS variables
  useEffect(() => {
    if (!containerRef.current) return;
    const root = containerRef.current;

    root.style.setProperty("--selected-cell-bg", theme.selectedCellBg);
    root.style.setProperty("--peer-cell-bg", theme.peerCellBg);
    root.style.setProperty("--same-number-outline", theme.sameNumberOutline);
    root.style.setProperty("--correct-number-color", theme.correctNumberColor);
    root.style.setProperty("--wrong-number-color", theme.wrongNumberColor);
    root.style.setProperty("--given-number-color", theme.givenNumberColor);
    root.style.setProperty("--board-border", theme.boardBorder);
    root.style.setProperty("--hint-primary-bg", theme.hintPrimaryBg);
    root.style.setProperty("--hint-secondary-bg", theme.hintSecondaryBg);
  }, [theme]);

  // Example board state (fixed for preview)
  // prettier-ignore
  const exampleValues = [
    5, 3, 0, 0, 7, 0, 0, 0, 0,
    6, 0, 0, 1, 9, 5, 0, 0, 0,
    0, 9, 8, 0, 0, 0, 0, 6, 0,
    8, 0, 0, 0, 6, 0, 0, 0, 3,
    4, 0, 0, 8, 0, 3, 0, 0, 1,
    7, 0, 0, 0, 2, 0, 0, 0, 6,
    0, 6, 0, 0, 0, 0, 2, 8, 0,
    0, 0, 0, 4, 1, 9, 0, 0, 5,
    0, 0, 0, 0, 8, 0, 0, 7, 9,
  ];

  // Example cell metadata
  const exampleMeta = exampleValues.map((val, idx) => {
    // Given cells (pre-filled)
    const isGiven = val !== 0 && idx < 20;

    // Cell 40 (center) is selected
    const isSelected = idx === 40;

    // Peers of cell 40 (row 4, col 4, block 4)
    const row = Math.floor(idx / 9);
    const col = idx % 9;
    const isPeer =
      row === 4 ||
      col === 4 ||
      (Math.floor(row / 3) === 1 && Math.floor(col / 3) === 1);

    // Cell 10 has wrong number (example)
    const isWrong = idx === 10;

    // Cell 20 has correct number (example)
    const isCorrect = idx === 20 && val !== 0;

    // Cells with same number as selected (value 8)
    const isSameNumber = val === 8 && idx !== 40;

    // Hint highlights
    const isHintPrimary = idx === 2; // Example hint target
    const isHintSecondary = idx === 11 || idx === 29; // Example hint peers

    // Notes for empty cells
    const hasNotes = val === 0 && (idx === 2 || idx === 6 || idx === 18);
    const notes = hasNotes ? 0b111000000 : 0; // Notes 7, 8, 9

    return {
      isGiven,
      isSelected,
      isPeer,
      isWrong,
      isCorrect,
      isSameNumber,
      isHintPrimary,
      isHintSecondary,
      notes,
    };
  });

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      <div className="text-sm font-medium text-gray-700">
        Preview (não jogável)
      </div>

      <div
        className="inline-grid grid-cols-9 gap-0 border-4"
        style={{ borderColor: "var(--board-border)" }}
        role="presentation"
        aria-label="Sudoku preview"
      >
        {exampleValues.map((val, idx) => {
          const meta = exampleMeta[idx];
          const row = Math.floor(idx / 9);
          const col = idx % 9;

          // Block borders
          let borderClass = "";
          if (col === 2 || col === 5) borderClass += " border-r-2";
          if (row === 2 || row === 5) borderClass += " border-b-2";

          // Cell background
          let bgStyle: React.CSSProperties = {};
          if (meta.isHintPrimary) {
            bgStyle.backgroundColor = "var(--hint-primary-bg)";
          } else if (meta.isHintSecondary) {
            bgStyle.backgroundColor = "var(--hint-secondary-bg)";
          } else if (meta.isSelected) {
            bgStyle.backgroundColor = "var(--selected-cell-bg)";
          } else if (
            meta.isPeer &&
            config.showPeerHighlight &&
            !meta.isSelected
          ) {
            bgStyle.backgroundColor = "var(--peer-cell-bg)";
          }

          // Number color
          let textStyle: React.CSSProperties = {};
          if (meta.isGiven) {
            textStyle.color = "var(--given-number-color)";
            textStyle.fontWeight = "bold";
          } else if (meta.isCorrect) {
            textStyle.color = "var(--correct-number-color)";
            textStyle.fontWeight = "600";
          } else if (meta.isWrong) {
            textStyle.color = "var(--wrong-number-color)";
            textStyle.fontWeight = "600";
          }

          // Same number outline
          let ringStyle: React.CSSProperties = {};
          if (meta.isSameNumber && config.showSameNumberHighlight) {
            ringStyle.outline = "2px solid var(--same-number-outline)";
            ringStyle.outlineOffset = "-2px";
          }

          // Selected cell outline
          if (meta.isSelected) {
            ringStyle.outline = "4px solid #3b82f6";
            ringStyle.outlineOffset = "-4px";
          }

          const combinedStyle = { ...bgStyle, ...ringStyle };

          return (
            <div
              key={idx}
              className={borderClass}
              style={{ borderColor: "var(--board-border)" }}
            >
              <div
                style={combinedStyle}
                className="w-12 h-12 border border-gray-300 flex items-center justify-center relative"
              >
                {val !== 0 ? (
                  <span className="text-2xl" style={textStyle}>
                    {val}
                  </span>
                ) : meta.notes !== 0 ? (
                  <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
                      const digit = d as Digit;
                      const isPresent = hasNote(meta.notes, digit);
                      return (
                        <div
                          key={d}
                          className="flex items-center justify-center text-[8px] text-gray-500"
                        >
                          {isPresent && <span>{d}</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 max-w-xs text-center">
        Demonstra: células dadas, corretas, erradas, selecionada, peers, mesmo
        número, notas e dicas
      </div>
    </div>
  );
}
