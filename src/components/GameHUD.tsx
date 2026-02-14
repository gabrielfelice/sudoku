import { useGameStore } from "@/state/store";
import { formatTime } from "@/lib/time";
import { Timer, XCircle, Target, Lightbulb } from "lucide-react";

export function GameHUD() {
  const timer = useGameStore((s) => s.timer);
  const mistakes = useGameStore((s) => s.mistakes);
  const difficulty = useGameStore((s) => s.difficulty);
  const maxErrors = useGameStore((s) => s.config.maxErrors);
  const hintsUsedThisPuzzle = useGameStore((s) => s.hintsUsedThisPuzzle);
  const hintLimit = useGameStore((s) => s.config.hintLimit);
  const expertHintLimit = useGameStore((s) => s.config.expertHintLimit);

  // Determine effective hint limit based on difficulty
  const effectiveHintLimit =
    difficulty === "expert" ? expertHintLimit : hintLimit;

  // Format difficulty for display
  const difficultyLabels = {
    easy: "Fácil",
    medium: "Médio",
    hard: "Difícil",
    expert: "Expert",
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-2 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm mb-6">
      {/* Timer */}
      <div className="flex items-center gap-3">
        <Timer className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
            Tempo
          </span>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white font-mono leading-none">
            {formatTime(timer.elapsedMs)}
          </span>
        </div>
      </div>

      {/* Errors */}
      <div className="flex items-center gap-3">
        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
            Erros
          </span>
          <span className="text-xl font-extrabold text-red-600 dark:text-red-400 leading-none">
            {maxErrors !== null ? `${mistakes}/${maxErrors}` : mistakes}
          </span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
            Nível
          </span>
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">
            {difficultyLabels[difficulty]}
          </span>
        </div>
      </div>

      {/* Hints */}
      <div className="flex items-center gap-3">
        <Lightbulb className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
            Dicas
          </span>
          <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 leading-none">
            {effectiveHintLimit !== null
              ? `${hintsUsedThisPuzzle}/${effectiveHintLimit}`
              : hintsUsedThisPuzzle}
          </span>
        </div>
      </div>
    </div>
  );
}
