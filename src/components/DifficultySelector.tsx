"use client";

import { useGameStore } from "@/state/store";

export function DifficultySelector() {
  const difficulty = useGameStore((state) => state.difficulty);
  const dispatch = useGameStore((state) => state.dispatch);

  const difficulties: Array<{
    value: "easy" | "medium" | "hard" | "expert";
    label: string;
    color: string;
  }> = [
    { value: "easy", label: "Fácil", color: "bg-green-500" },
    { value: "medium", label: "Médio", color: "bg-yellow-500" },
    { value: "hard", label: "Difícil", color: "bg-orange-500" },
    { value: "expert", label: "Expert", color: "bg-red-500" },
  ];

  const handleChange = (value: "easy" | "medium" | "hard" | "expert") => {
    dispatch({ type: "SET_DIFFICULTY", difficulty: value });
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Dificuldade:
      </label>
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => handleChange(diff.value)}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${
                difficulty === diff.value
                  ? `${diff.color} text-white shadow-md`
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
          >
            {diff.label}
          </button>
        ))}
      </div>
    </div>
  );
}
