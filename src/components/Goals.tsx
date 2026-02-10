"use client";

import { useState } from "react";
import { useProfileStore } from "@/state/profileStore";
import { Goal, createCustomGoal } from "@/lib/profile";

export function Goals() {
  const profile = useProfileStore((s) => s.profile);
  const addGoal = useProfileStore((s) => s.addGoal);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [goalType, setGoalType] = useState<Goal["type"]>(
    "puzzles_by_difficulty",
  );
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | "expert"
  >("easy");
  const [target, setTarget] = useState(5);

  const handleCreateGoal = () => {
    if (goalType === "puzzles_by_difficulty") {
      addGoal(goalType, target, difficulty);
    } else {
      addGoal(goalType, target);
    }
    setShowCreateForm(false);
    setTarget(5);
  };

  const getGoalDescription = (goal: Goal): string => {
    switch (goal.type) {
      case "puzzles_by_difficulty":
        return `Complete ${goal.target} ${goal.difficulty} puzzles`;
      case "error_limit":
        return `Complete a puzzle with ${goal.target} or fewer errors`;
      case "streak":
        return `Complete ${goal.target} puzzles in a row`;
      case "time_target":
        return `Complete a puzzle in under ${Math.floor(goal.target / 60000)} minutes`;
      default:
        return "Unknown goal";
    }
  };

  const defaultGoals = profile.goals.filter((g) => !g.custom);
  const customGoals = profile.goals.filter((g) => g.custom);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Goals & Achievements</h2>
        <p className="text-gray-600">
          Track your progress and set custom challenges
        </p>
      </div>

      {/* Default Goals */}
      <section className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Default Goals</h3>
        <div className="space-y-3">
          {defaultGoals.map((goal) => (
            <div
              key={goal.id}
              className={`border rounded-lg p-4 ${
                goal.completed
                  ? "bg-green-50 border-green-300"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">
                    {getGoalDescription(goal)}
                  </h4>
                  {goal.completed && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Completed on{" "}
                      {new Date(goal.completedAt!).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {goal.completed && <span className="text-3xl">🏆</span>}
              </div>
              {!goal.completed && goal.type !== "error_limit" && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>
                      {goal.current} / {goal.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Custom Goals */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Custom Goals</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600"
          >
            {showCreateForm ? "Cancel" : "+ Create Goal"}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-bold mb-3">Create Custom Goal</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Goal Type
                </label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as Goal["type"])}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="puzzles_by_difficulty">
                    Complete X puzzles (by difficulty)
                  </option>
                  <option value="error_limit">
                    Complete with X or fewer errors
                  </option>
                  <option value="streak">Complete X puzzles in a row</option>
                </select>
              </div>

              {goalType === "puzzles_by_difficulty" && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as typeof difficulty)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Target
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <button
                onClick={handleCreateGoal}
                className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600"
              >
                Create Goal
              </button>
            </div>
          </div>
        )}

        {customGoals.length > 0 ? (
          <div className="space-y-3">
            {customGoals.map((goal) => (
              <div
                key={goal.id}
                className={`border rounded-lg p-4 ${
                  goal.completed
                    ? "bg-green-50 border-green-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">
                      {getGoalDescription(goal)}
                    </h4>
                    {goal.completed && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Completed on{" "}
                        {new Date(goal.completedAt!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {goal.completed && <span className="text-3xl">🏆</span>}
                </div>
                {!goal.completed && goal.type !== "error_limit" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8 border border-gray-200 rounded-lg">
            <p>No custom goals yet.</p>
            <p className="text-sm mt-1">Create your first custom goal!</p>
          </div>
        )}
      </section>
    </div>
  );
}
