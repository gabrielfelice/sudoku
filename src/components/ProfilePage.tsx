"use client";

import { useState, useMemo } from "react";
import { useProfileStore } from "@/state/profileStore";
import GameFilters, {
  DifficultyFilter,
  SortField,
  SortDirection,
} from "./GameFilters";
import styles from "./ProfilePage.module.css";

function formatTime(ms: number): string {
  if (ms === 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile);
  const setName = useProfileStore((s) => s.setName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  // Filter and sort state
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let games = [...profile.recentGames];

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      games = games.filter((game) => game.difficulty === difficultyFilter);
    }

    // Apply sorting
    games.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison = a.startedAt - b.startedAt;
          break;
        case "time":
          comparison = a.timeMs - b.timeMs;
          break;
        case "errors":
          comparison = a.mistakes - b.mistakes;
          break;
        case "difficulty":
          const diffOrder = { easy: 1, medium: 2, hard: 3, expert: 4 };
          comparison = diffOrder[a.difficulty] - diffOrder[b.difficulty];
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return games;
  }, [profile.recentGames, difficultyFilter, sortField, sortDirection]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const difficulties: Array<"easy" | "medium" | "hard" | "expert"> = [
    "easy",
    "medium",
    "hard",
    "expert",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>👤</div>
        {isEditingName ? (
          <div className={styles.nameEdit}>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") {
                  setTempName(profile.name);
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className={styles.nameInput}
            />
            <button onClick={handleSaveName} className={styles.saveButton}>
              ✓
            </button>
            <button
              onClick={() => {
                setTempName(profile.name);
                setIsEditingName(false);
              }}
              className={styles.cancelButton}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={styles.nameDisplay}>
            <h1>{profile.name}</h1>
            <button
              onClick={() => setIsEditingName(true)}
              className={styles.editButton}
            >
              ✏️
            </button>
          </div>
        )}
        <p className={styles.memberSince}>
          Member since {formatDate(profile.createdAt)}
        </p>
      </div>

      <div className={styles.section}>
        <h2>Statistics by Difficulty</h2>
        <div className={styles.statsGrid}>
          {difficulties.map((diff) => {
            const stats = profile.stats[diff];
            return (
              <div key={diff} className={styles.statCard}>
                <h3 className={styles.difficultyTitle}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </h3>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Games Started:</span>
                  <span className={styles.statValue}>{stats.gamesStarted}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Games Completed:</span>
                  <span className={styles.statValue}>
                    {stats.gamesCompleted}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Best Time:</span>
                  <span className={styles.statValue}>
                    {formatTime(stats.bestTimeMs || 0)}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Avg Time:</span>
                  <span className={styles.statValue}>
                    {formatTime(Math.round(stats.avgTimeMs))}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Avg Mistakes:</span>
                  <span className={styles.statValue}>
                    {stats.avgMistakes.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {profile.badges.length > 0 && (
        <div className={styles.section}>
          <h2>Badges ({profile.badges.length})</h2>
          <div className={styles.badgeGrid}>
            {profile.badges.map((badge) => (
              <div key={badge.id} className={styles.badgeCard}>
                <div className={styles.badgeIcon}>🏅</div>
                <div className={styles.badgeName}>{badge.name}</div>
                <div className={styles.badgeDesc}>{badge.description}</div>
                <div className={styles.badgeDate}>
                  {formatDate(badge.earnedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2>Jogos Recentes</h2>
        {profile.recentGames.length === 0 ? (
          <p className={styles.emptyState}>Nenhum jogo jogado ainda</p>
        ) : (
          <>
            <GameFilters
              selectedDifficulty={difficultyFilter}
              onDifficultyChange={setDifficultyFilter}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
            {filteredAndSortedGames.length === 0 ? (
              <p className={styles.emptyState}>
                Nenhum jogo encontrado com os filtros selecionados
              </p>
            ) : (
              <div className={styles.gameList}>
                {filteredAndSortedGames.slice(0, 20).map((game) => (
                  <div key={game.id} className={styles.gameCard}>
                    <div className={styles.gameHeader}>
                      <span
                        className={`${styles.difficulty} ${styles[game.difficulty]}`}
                      >
                        {game.difficulty.charAt(0).toUpperCase() +
                          game.difficulty.slice(1)}
                      </span>
                      <span className={styles.gameDate}>
                        {formatDate(game.startedAt)}
                      </span>
                    </div>
                    <div className={styles.gameStats}>
                      <div className={styles.gameStat}>
                        <span className={styles.gameStatLabel}>Tempo:</span>
                        <span className={styles.gameStatValue}>
                          {formatTime(game.timeMs)}
                        </span>
                      </div>
                      <div className={styles.gameStat}>
                        <span className={styles.gameStatLabel}>Erros:</span>
                        <span className={styles.gameStatValue}>
                          {game.mistakes}
                        </span>
                      </div>
                      <div className={styles.gameStat}>
                        <span
                          className={`${styles.gameStatus} ${game.completed ? styles.completed : styles.abandoned}`}
                        >
                          {game.completed ? "✓ Completo" : "✕ Abandonado"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
