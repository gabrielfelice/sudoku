"use client";

import { Badge } from "@/lib/profile";
import styles from "./VictoryModal.module.css";

interface VictoryModalProps {
  timeMs: number;
  mistakes: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  seed?: number;
  newBadges: Badge[];
  onPlayAgain: () => void;
  onClose: () => void;
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
  onPlayAgain,
  onClose,
}: VictoryModalProps) {
  const handleShareSeed = () => {
    if (seed) {
      navigator.clipboard.writeText(`Sudoku seed: ${seed}`);
      alert("Seed copied to clipboard!");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.trophy}>🏆</div>
          <h2>Congratulations!</h2>
          <p>You solved the puzzle!</p>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Time</div>
            <div className={styles.statValue}>{formatTime(timeMs)}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Mistakes</div>
            <div className={styles.statValue}>{mistakes}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Difficulty</div>
            <div className={styles.statValue}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
          </div>
        </div>

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
