"use client";

import { useState } from "react";
import styles from "./GameFilters.module.css";

export type DifficultyFilter = "all" | "easy" | "medium" | "hard" | "expert";
export type SortField = "date" | "time" | "errors" | "difficulty";
export type SortDirection = "asc" | "desc";

interface GameFiltersProps {
  selectedDifficulty: DifficultyFilter;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}

export default function GameFilters({
  selectedDifficulty,
  onDifficultyChange,
  sortField,
  sortDirection,
  onSortChange,
}: GameFiltersProps) {
  const difficulties: Array<{ value: DifficultyFilter; label: string }> = [
    { value: "all", label: "Todas" },
    { value: "easy", label: "Fácil" },
    { value: "medium", label: "Médio" },
    { value: "hard", label: "Difícil" },
    { value: "expert", label: "Expert" },
  ];

  const sortOptions: Array<{ value: SortField; label: string }> = [
    { value: "date", label: "Data" },
    { value: "time", label: "Tempo" },
    { value: "errors", label: "Erros" },
    { value: "difficulty", label: "Dificuldade" },
  ];

  const handleSortFieldChange = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      onSortChange(field, sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Default to descending for new field
      onSortChange(field, "desc");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.filterGroup}>
        <label className={styles.label}>Filtrar por Dificuldade:</label>
        <div className={styles.buttonGroup}>
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              className={`${styles.filterButton} ${selectedDifficulty === diff.value ? styles.active : ""}`}
              onClick={() => onDifficultyChange(diff.value)}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sortGroup}>
        <label className={styles.label}>Ordenar por:</label>
        <div className={styles.sortControls}>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.sortButton} ${sortField === option.value ? styles.active : ""}`}
              onClick={() => handleSortFieldChange(option.value)}
            >
              {option.label}
              {sortField === option.value && (
                <span className={styles.sortIcon}>
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
