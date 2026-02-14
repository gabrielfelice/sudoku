"use client";

import { useEffect } from "react";
import { useGameStore } from "@/state/store";

/**
 * Hook para aplicar o tema atual como CSS variables
 */
export function useTheme() {
  const theme = useGameStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--selected-cell-bg", theme.selectedCellBg);
    root.style.setProperty("--peer-cell-bg", theme.peerCellBg);
    root.style.setProperty("--same-number-outline", theme.sameNumberOutline);
    root.style.setProperty("--correct-number-color", theme.correctNumberColor);
    root.style.setProperty("--wrong-number-color", theme.wrongNumberColor);
    root.style.setProperty("--given-number-color", theme.givenNumberColor);
    root.style.setProperty("--board-border", theme.boardBorder);
    root.style.setProperty("--hint-primary-bg", theme.hintPrimaryBg);
    root.style.setProperty("--hint-secondary-bg", theme.hintSecondaryBg);

    // Milestone M: New customization variables
    root.style.setProperty(
      "--global-background",
      theme.globalBackground || "#f5f5f5",
    );
    root.style.setProperty(
      "--cell-background",
      theme.cellBackground || "#ffffff",
    );
    root.style.setProperty("--cell-border", theme.cellBorder || "#e0e0e0");
  }, [theme]);
}
