"use client";

import { useState } from "react";
import { useGameStore } from "@/state/store";
import { PlayMode } from "@/state/types";
import {
  getPuzzlesByDifficulty,
  getDailyPuzzle,
  getAllTags,
  type CuratedPuzzle,
} from "@/engine/catalog";
import { generatePuzzle } from "@/engine/generator";

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewGameModal({ isOpen, onClose }: NewGameModalProps) {
  const dispatch = useGameStore((state) => state.dispatch);
  const difficulty = useGameStore((state) => state.difficulty);

  const [activeTab, setActiveTab] = useState<"generate" | "library" | "daily">(
    "generate",
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty);
  const [selectedMode, setSelectedMode] = useState<PlayMode>("normal");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPuzzle, setSelectedPuzzle] = useState<CuratedPuzzle | null>(
    null,
  );

  if (!isOpen) return null;

  const handleGenerate = () => {
    const puzzle = generatePuzzle(selectedDifficulty);
    dispatch({
      type: "NEW_GAME",
      payload: {
        given: puzzle.given,
        solution: puzzle.solution,
        difficulty: selectedDifficulty,
        seed: puzzle.seed,
        puzzleSource: "generated",
        playMode: selectedMode,
      },
    });
    onClose();
  };

  const handleStartCatalog = () => {
    if (!selectedPuzzle) return;
    dispatch({
      type: "NEW_GAME",
      payload: {
        given: selectedPuzzle.given,
        solution: selectedPuzzle.solution,
        difficulty: selectedPuzzle.difficulty,
        puzzleSource: "catalog",
        puzzleId: selectedPuzzle.id,
        playMode: selectedMode,
      },
    });
    onClose();
  };

  const handleStartDaily = () => {
    const dailyPuzzle = getDailyPuzzle();
    dispatch({
      type: "NEW_GAME",
      payload: {
        given: dailyPuzzle.given,
        solution: dailyPuzzle.solution,
        difficulty: dailyPuzzle.difficulty,
        puzzleSource: "daily",
        puzzleId: dailyPuzzle.id,
        playMode: selectedMode,
      },
    });
    onClose();
  };

  const libraryPuzzles = getPuzzlesByDifficulty(selectedDifficulty);
  const filteredPuzzles = selectedTag
    ? libraryPuzzles.filter((p) => p.tags.includes(selectedTag))
    : libraryPuzzles;
  const allTags = getAllTags();
  const dailyPuzzle = getDailyPuzzle();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Novo Jogo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "generate"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            🎲 Gerar
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "library"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            📚 Biblioteca
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "daily"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            📅 Puzzle do Dia
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "generate" && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gere um novo puzzle aleatório com a dificuldade desejada.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dificuldade
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["easy", "medium", "hard", "expert"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      selectedDifficulty === diff
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {diff === "easy" && "Fácil"}
                    {diff === "medium" && "Médio"}
                    {diff === "hard" && "Difícil"}
                    {diff === "expert" && "Expert"}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modo de Jogo
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedMode("normal")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMode === "normal"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🎯 Normal
                </button>
                <button
                  onClick={() => setSelectedMode("zen")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMode === "zen"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🧘 Zen
                </button>
                <button
                  onClick={() => setSelectedMode("challenge")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMode === "challenge"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  ⚡ Desafio
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              Gerar Novo Puzzle
            </button>
          </div>
        )}

        {activeTab === "library" && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Escolha um puzzle curado da nossa biblioteca.
            </p>

            {/* Difficulty Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dificuldade
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["easy", "medium", "hard", "expert"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      setSelectedPuzzle(null);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedDifficulty === diff
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {diff === "easy" && "Fácil"}
                    {diff === "medium" && "Médio"}
                    {diff === "hard" && "Difícil"}
                    {diff === "expert" && "Expert"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtrar por Tag
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedTag === null
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Todos
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedTag === tag
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Puzzle List */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {filteredPuzzles.map((puzzle) => (
                <button
                  key={puzzle.id}
                  onClick={() => setSelectedPuzzle(puzzle)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedPuzzle?.id === puzzle.id
                      ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                      : "bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {puzzle.id}
                      </h4>
                      {puzzle.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {puzzle.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {puzzle.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Mode Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modo de Jogo
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedMode("normal")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMode === "normal"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🎯 Normal
                </button>
                <button
                  onClick={() => setSelectedMode("zen")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMode === "zen"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🧘 Zen
                </button>
                <button
                  onClick={() => setSelectedMode("challenge")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMode === "challenge"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  ⚡ Desafio
                </button>
              </div>
            </div>

            <button
              onClick={handleStartCatalog}
              disabled={!selectedPuzzle}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Iniciar Puzzle Selecionado
            </button>
          </div>
        )}

        {activeTab === "daily" && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Jogue o puzzle especial de hoje! Um novo puzzle aparece a cada
              dia.
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">📅</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Puzzle do Dia
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date().toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Dificuldade
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white capitalize">
                    {dailyPuzzle.difficulty === "easy" && "Fácil"}
                    {dailyPuzzle.difficulty === "medium" && "Médio"}
                    {dailyPuzzle.difficulty === "hard" && "Difícil"}
                    {dailyPuzzle.difficulty === "expert" && "Expert"}
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">ID</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {dailyPuzzle.id}
                  </p>
                </div>
              </div>

              {dailyPuzzle.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {dailyPuzzle.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1">
                {dailyPuzzle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Mode Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modo de Jogo
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedMode("normal")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMode === "normal"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🎯 Normal
                </button>
                <button
                  onClick={() => setSelectedMode("zen")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMode === "zen"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🧘 Zen
                </button>
                <button
                  onClick={() => setSelectedMode("challenge")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMode === "challenge"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  ⚡ Desafio
                </button>
              </div>
            </div>

            <button
              onClick={handleStartDaily}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30"
            >
              Jogar Puzzle do Dia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
