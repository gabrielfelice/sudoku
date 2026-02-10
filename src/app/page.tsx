"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/state/store";
import { useProfileStore } from "@/state/profileStore";
import { generatePuzzleWithCache } from "@/engine/generator";
import { saveGame, loadGame, clearSave } from "@/lib/storage";
import { useTheme } from "@/lib/useTheme";

// Game components
import { TopBar } from "@/components/TopBar";
import { SudokuBoard } from "@/components/SudokuBoard";
import { ActionBar } from "@/components/ActionBar";
import { Keypad } from "@/components/Keypad";
import { PauseOverlay } from "@/components/PauseOverlay";
import { Toast } from "@/components/Toast";
import { ContinueGameModal } from "@/components/ContinueGameModal";
import { KeyboardController } from "@/components/KeyboardController";
import { HintModal } from "@/components/HintModal";
import { ErrorExplanationModal } from "@/components/ErrorExplanationModal";
import { DifficultySelector } from "@/components/DifficultySelector";
import { SettingsModal } from "@/components/SettingsModal";

// Milestone E components
import TutorialTour from "@/components/TutorialTour";
import VictoryModal from "@/components/VictoryModal";
import ProfilePage from "@/components/ProfilePage";
import TrainingHub from "@/components/TrainingHub";
import LessonRunner from "@/components/LessonRunner";
import { Badge } from "@/lib/profile";

// Milestone F components
import { NewGameModal } from "@/components/NewGameModal";

// Milestone J components
import { Shop } from "@/components/Shop";
import { Goals } from "@/components/Goals";
import { LearningCurve } from "@/components/LearningCurve";
import { ModeSelector } from "@/components/ModeSelector";
import { HelpPanel } from "@/components/HelpPanel";

type View =
  | "play"
  | "training"
  | "profile"
  | "lesson"
  | "shop"
  | "goals"
  | "stats";

export default function HomePage() {
  const dispatch = useGameStore((s) => s.dispatch);
  const paused = useGameStore((s) => s.paused);
  const toast = useGameStore((s) => s.toast);
  const difficulty = useGameStore((s) => s.difficulty);
  const seed = useGameStore((s) => s.seed);
  const values = useGameStore((s) => s.values);
  const solution = useGameStore((s) => s.solution);
  const mistakes = useGameStore((s) => s.mistakes);
  const timer = useGameStore((s) => s.timer);
  const currentSessionId = useGameStore((s) => s.currentSessionId);
  const gameState = useGameStore();

  const profile = useProfileStore((s) => s.profile);
  const startGame = useProfileStore((s) => s.startGame);
  const finishGame = useProfileStore((s) => s.finishGame);

  const [view, setView] = useState<View>("play");
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryBadges, setVictoryBadges] = useState<Badge[]>([]);
  const [victoryCoins, setVictoryCoins] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Apply theme
  useTheme();

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load saved config and theme on mount
  useEffect(() => {
    const { loadConfig, loadTheme } = require("@/lib/config-storage");
    const savedConfig = loadConfig();
    const savedTheme = loadTheme();

    if (savedConfig) {
      dispatch({ type: "SET_CONFIG", config: savedConfig });
    }
    if (savedTheme) {
      dispatch({ type: "SET_THEME", theme: savedTheme });
    }
  }, [dispatch]);

  // Sync sound manager with config
  useEffect(() => {
    const { setSoundEnabled } = require("@/lib/sounds");
    setSoundEnabled(gameState.config.soundEnabled);
  }, [gameState.config.soundEnabled]);

  // Auto-save config and theme when they change
  useEffect(() => {
    if (!isInitialized) return;

    const { saveConfig, saveTheme } = require("@/lib/config-storage");
    saveConfig(gameState.config);
    saveTheme(gameState.theme);
  }, [gameState.config, gameState.theme, isInitialized]);

  // Check for tutorial on first load
  useEffect(() => {
    if (!profile.tutorialCompleted && isInitialized) {
      setShowTutorial(true);
    }
  }, [profile.tutorialCompleted, isInitialized]);

  // Check for saved game on mount
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setShowContinueModal(true);
    } else {
      // No saved game, start fresh with generated puzzle
      handleStartNewGame();
    }
  }, [dispatch]);

  // Auto-save game state whenever it changes (debounced)
  useEffect(() => {
    if (!isInitialized || view !== "play") return;

    const timeoutId = setTimeout(() => {
      saveGame(gameState);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [gameState, isInitialized, view]);

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER", now: Date.now() });
    }, 250);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Check for victory
  useEffect(() => {
    if (view !== "play" || !currentSessionId) return;

    const isSolved = values.every(
      (val, idx) => val !== 0 && val === solution[idx],
    );

    if (isSolved && !showVictory) {
      // Game completed!
      const result = finishGame(
        currentSessionId,
        timer.elapsedMs,
        mistakes,
        true,
        gameState.hintsUsedThisPuzzle,
      );
      setVictoryBadges(result.newBadges);
      setVictoryCoins(result.coinsEarned);
      setShowVictory(true);
      dispatch({ type: "PAUSE" });
      dispatch({ type: "SET_SESSION_ID", sessionId: null });
    }
  }, [
    values,
    solution,
    currentSessionId,
    view,
    showVictory,
    finishGame,
    timer.elapsedMs,
    mistakes,
    dispatch,
  ]);

  const handleStartNewGame = (
    playMode: "normal" | "zen" | "challenge" = "normal",
  ) => {
    try {
      const puzzle = generatePuzzleWithCache(difficulty);
      dispatch({
        type: "NEW_GAME",
        payload: {
          given: puzzle.given,
          solution: puzzle.solution,
          difficulty: puzzle.difficulty,
          seed: puzzle.seed,
          puzzleSource: "generated",
          playMode,
        },
      });

      // Start session tracking
      const sessionId = startGame(puzzle.difficulty, puzzle.seed);
      dispatch({ type: "SET_SESSION_ID", sessionId });

      setIsInitialized(true);
      setShowVictory(false);
    } catch (error) {
      console.error("Failed to generate puzzle:", error);
    }
  };

  const handleContinue = () => {
    const saved = loadGame();
    if (saved) {
      dispatch({
        type: "LOAD_SAVED_GAME",
        given: saved.puzzle.given,
        solution: saved.puzzle.solution,
        values: saved.state.values,
        meta: saved.state.meta,
        mistakes: saved.state.mistakes,
        elapsedMs: saved.state.elapsedMs,
      });

      // Start new session for continued game
      const sessionId = startGame(
        saved.puzzle.difficulty || "medium",
        saved.puzzle.seed,
      );
      dispatch({ type: "SET_SESSION_ID", sessionId });

      dispatch({
        type: "SET_TOAST",
        message: "Jogo retomado!",
        toastType: "success",
      });
    }
    setShowContinueModal(false);
    setIsInitialized(true);
  };

  const handleNewGameFromModal = () => {
    clearSave();
    handleStartNewGame();
    setShowContinueModal(false);
  };

  const handleCloseToast = () => {
    dispatch({ type: "CLEAR_TOAST" });
  };

  const handleStartLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setView("lesson");
  };

  const handleLessonComplete = () => {
    setView("training");
    setCurrentLessonId(null);
  };

  const handleLessonExit = () => {
    setView("training");
    setCurrentLessonId(null);
  };

  const handleVictoryPlayAgain = () => {
    setShowVictory(false);
    setShowModeSelector(true);
  };

  const handleVictoryClose = () => {
    setShowVictory(false);
    dispatch({ type: "RESUME" });
  };

  const handleModeSelect = (mode: "normal" | "zen" | "challenge") => {
    handleStartNewGame(mode);
    setShowModeSelector(false);
  };

  return (
    <>
      {/* Tutorial */}
      {showTutorial && (
        <TutorialTour
          onComplete={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
        />
      )}

      {/* Victory Modal */}
      {showVictory && (
        <VictoryModal
          timeMs={timer.elapsedMs}
          mistakes={mistakes}
          difficulty={difficulty}
          seed={seed}
          newBadges={victoryBadges}
          coinsEarned={victoryCoins}
          onPlayAgain={handleVictoryPlayAgain}
          onClose={handleVictoryClose}
        />
      )}

      {/* Continue game modal */}
      {showContinueModal && (
        <ContinueGameModal
          onContinue={handleContinue}
          onNewGame={handleNewGameFromModal}
        />
      )}

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* New Game modal */}
      <NewGameModal
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
      />

      {/* Hint modal */}
      <HintModal />

      {/* Error explanation modal */}
      <ErrorExplanationModal />

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}

      {/* Mode Selector */}
      {showModeSelector && (
        <ModeSelector
          onSelectMode={handleModeSelect}
          onClose={() => setShowModeSelector(false)}
        />
      )}

      {/* Keyboard controller */}
      {view === "play" && <KeyboardController />}

      {/* Main UI */}
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-blue-600">Sudoku</h1>
                {/* Coin Balance */}
                {isMounted && (
                  <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                    <span className="text-xl">🪙</span>
                    <span className="font-bold text-yellow-800 dark:text-yellow-200">
                      {profile.coins}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setView("play")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    view === "play"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Play
                </button>
                <button
                  onClick={() => setView("shop")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    view === "shop"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  🛒 Shop
                </button>
                <button
                  onClick={() => setView("goals")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    view === "goals"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  🎯 Goals
                </button>
                <button
                  onClick={() => setView("stats")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    view === "stats"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  📈 Stats
                </button>
                <button
                  onClick={() => setView("training")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    view === "training" || view === "lesson"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Training
                </button>
                <button
                  onClick={() => setView("profile")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    view === "profile"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="px-3 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                  title="Show tutorial"
                >
                  ❓
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 p-4">
          {view === "play" && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <TopBar />

                <div className="px-6 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <DifficultySelector />
                  <div className="flex items-center gap-3">
                    {seed && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Seed: {seed}
                      </div>
                    )}
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      title="Configurações"
                    >
                      ⚙️ Settings
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-6 w-full justify-center">
                    {/* Main game area */}
                    <div className="flex flex-col items-center gap-6">
                      {/* Board with pause overlay */}
                      <div className="relative">
                        <SudokuBoard />
                        {paused && <PauseOverlay />}
                      </div>
                      <ActionBar />
                      <Keypad />
                    </div>
                    {/* Help Panel Sidebar */}
                    <div className="w-64 flex-shrink-0">
                      <HelpPanel />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "training" && (
            <TrainingHub onStartLesson={handleStartLesson} />
          )}

          {view === "lesson" && currentLessonId && (
            <LessonRunner
              lessonId={currentLessonId}
              onComplete={handleLessonComplete}
              onExit={handleLessonExit}
            />
          )}

          {view === "profile" && <ProfilePage />}

          {view === "shop" && (
            <div className="max-w-7xl mx-auto">
              <Shop onClose={() => setView("play")} />
            </div>
          )}

          {view === "goals" && <Goals />}

          {view === "stats" && <LearningCurve />}
        </div>
      </div>
    </>
  );
}
