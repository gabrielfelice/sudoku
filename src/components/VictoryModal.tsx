"use client";

import { Badge } from "@/lib/profile";
import styles from "./VictoryModal.module.css";

interface VictoryModalProps {
  timeMs: number;
  mistakes: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  seed?: number;
  newBadges: Badge[];
  coinsEarned: number;
  onPlayAgain: () => void;
  onClose: () => void;
  playMode?: "normal" | "zen" | "challenge"; // NEW: Milestone K
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function VictoryModal({
  timeMs,
  mistakes,
  difficulty,
  seed,
  newBadges,
  coinsEarned,
  onPlayAgain,
  onClose,
  playMode = "normal", // NEW: Default to normal
}: VictoryModalProps) {
  const handleShareSeed = () => {
    if (seed) {
      navigator.clipboard.writeText(`Sudoku seed: ${seed}`);
      alert("Seed copied to clipboard!");
    }
  };

  // Mode-specific display
  const modeEmoji = {
    normal: "🎯",
    zen: "🧘",
    challenge: "⚡",
  };

  const modeLabel = {
    normal: "Normal",
    zen: "Zen",
    challenge: "Challenge",
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.trophy}>🏆</div>
          <h2>Congratulations!</h2>
          <p>You solved the puzzle!</p>
          {/* Mode Badge */}
          <div className="mt-2 text-sm font-semibold">
            {modeEmoji[playMode]} {modeLabel[playMode]} Mode
          </div>
        </div>

        <div className={styles.stats}>
          {/* Show time only if not Zen mode */}
          {playMode !== "zen" && (
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Time</div>
              <div className={styles.statValue}>{formatTime(timeMs)}</div>
            </div>
          )}
          {/* Show mistakes only if not Zen mode */}
          {playMode !== "zen" && (
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Mistakes</div>
              <div className={styles.statValue}>{mistakes}</div>
            </div>
          )}
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Difficulty</div>
            <div className={styles.statValue}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
          </div>
        </div>

        {/* Coins Earned */}
        {coinsEarned > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 my-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl animate-bounce">🪙</span>
              <div>
                <div className="text-sm text-yellow-700 font-semibold">
                  Coins Earned
                </div>
                <div className="text-3xl font-bold text-yellow-600">
                  +{coinsEarned}
                </div>
              </div>
            </div>
          </div>
        )}

        {newBadges.length > 0 && (
          <div className={styles.badges}>
            <h3>New Badges Earned!</h3>
            <div className={styles.badgeList}>
              {newBadges.map((badge) => (
                <div key={badge.id} className={styles.badge}>
                  <div className={styles.badgeIcon}>🏅</div>
                  <div className={styles.badgeInfo}>
                    <div className={styles.badgeName}>{badge.name}</div>
                    <div className={styles.badgeDesc}>{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.playAgainButton} onClick={onPlayAgain}>
            Play Again
          </button>
          {seed && (
            <button className={styles.shareButton} onClick={handleShareSeed}>
              Share Seed
            </button>
          )}
          <button className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
