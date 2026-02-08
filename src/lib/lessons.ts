import { CellValue } from "@/engine";

export interface Lesson {
  id: string;
  title: string;
  description: string;
  objective: string;
  puzzle: {
    given: CellValue[];
    solution: CellValue[];
  };
  allowedTechniques: string[];
  prerequisites: string[];
}

export const LESSONS: Lesson[] = [
  {
    id: "lesson_1_naked_single",
    title: "Lesson 1: Naked Singles",
    description:
      "Learn to identify cells where only one number can fit based on row, column, and box constraints.",
    objective:
      "Complete the puzzle using only naked single technique. A naked single is when a cell has only one possible candidate.",
    puzzle: {
      // Easy puzzle focusing on naked singles
      given: [
        5, 3, 0, 0, 7, 0, 0, 0, 0, 6, 0, 0, 1, 9, 5, 0, 0, 0, 0, 9, 8, 0, 0, 0,
        0, 6, 0, 8, 0, 0, 0, 6, 0, 0, 0, 3, 4, 0, 0, 8, 0, 3, 0, 0, 1, 7, 0, 0,
        0, 2, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 2, 8, 0, 0, 0, 0, 4, 1, 9, 0, 0, 5,
        0, 0, 0, 0, 8, 0, 0, 7, 9,
      ],
      solution: [
        5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2,
        5, 6, 7, 8, 5, 9, 7, 6, 1, 4, 2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3,
        9, 2, 4, 8, 5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5,
        3, 4, 5, 2, 8, 6, 1, 7, 9,
      ],
    },
    allowedTechniques: ["naked_single"],
    prerequisites: [],
  },
  {
    id: "lesson_2_hidden_single",
    title: "Lesson 2: Hidden Singles",
    description:
      "Learn to find numbers that can only go in one cell within a row, column, or box.",
    objective:
      "Complete the puzzle using naked singles and hidden singles. A hidden single is when a number can only fit in one cell in a house (row/column/box).",
    puzzle: {
      given: [
        0, 0, 0, 2, 6, 0, 7, 0, 1, 6, 8, 0, 0, 7, 0, 0, 9, 0, 1, 9, 0, 0, 0, 4,
        5, 0, 0, 8, 2, 0, 1, 0, 0, 0, 4, 0, 0, 0, 4, 6, 0, 2, 9, 0, 0, 0, 5, 0,
        0, 0, 3, 0, 2, 8, 0, 0, 9, 3, 0, 0, 0, 7, 4, 0, 4, 0, 0, 5, 0, 0, 3, 6,
        7, 0, 3, 0, 1, 8, 0, 0, 0,
      ],
      solution: [
        4, 3, 5, 2, 6, 9, 7, 8, 1, 6, 8, 2, 5, 7, 1, 4, 9, 3, 1, 9, 7, 8, 3, 4,
        5, 6, 2, 8, 2, 6, 1, 9, 5, 3, 4, 7, 3, 7, 4, 6, 8, 2, 9, 1, 5, 9, 5, 1,
        7, 4, 3, 6, 2, 8, 5, 1, 9, 3, 2, 6, 8, 7, 4, 2, 4, 8, 9, 5, 7, 1, 3, 6,
        7, 6, 3, 4, 1, 8, 2, 5, 9,
      ],
    },
    allowedTechniques: ["naked_single", "hidden_single"],
    prerequisites: ["lesson_1_naked_single"],
  },
  {
    id: "lesson_3_pairs",
    title: "Lesson 3: Naked Pairs",
    description:
      "Learn to identify when two cells in a house can only contain the same two numbers, eliminating those numbers from other cells.",
    objective:
      "Complete the puzzle using naked singles, hidden singles, and naked pairs. A naked pair is when two cells in a house have exactly the same two candidates.",
    puzzle: {
      given: [
        0, 0, 0, 0, 0, 0, 6, 8, 0, 0, 0, 0, 0, 7, 3, 0, 0, 9, 3, 0, 9, 0, 0, 0,
        0, 4, 5, 4, 9, 0, 0, 0, 0, 0, 0, 0, 8, 0, 3, 0, 5, 0, 9, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 7, 2, 9, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 4, 2, 0, 0, 0, 0,
        0, 4, 2, 0, 0, 0, 0, 0, 0,
      ],
      solution: [
        1, 7, 4, 3, 9, 5, 6, 8, 2, 6, 5, 2, 8, 7, 3, 1, 2, 9, 3, 8, 9, 6, 1, 2,
        7, 4, 5, 4, 9, 6, 1, 2, 7, 5, 3, 8, 8, 2, 3, 4, 5, 6, 9, 1, 7, 5, 1, 7,
        9, 3, 8, 4, 6, 2, 9, 6, 8, 5, 4, 1, 3, 2, 7, 7, 3, 5, 4, 2, 9, 8, 6, 1,
        6, 4, 2, 7, 8, 3, 5, 9, 1,
      ],
    },
    allowedTechniques: ["naked_single", "hidden_single", "naked_pair"],
    prerequisites: ["lesson_2_hidden_single"],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getAvailableLessons(completedLessons: string[]): Lesson[] {
  return LESSONS.filter((lesson) => {
    // Check if all prerequisites are completed
    return lesson.prerequisites.every((prereq) =>
      completedLessons.includes(prereq),
    );
  });
}

export function isLessonCompleted(
  lessonId: string,
  completedLessons: string[],
): boolean {
  return completedLessons.includes(lessonId);
}

export function isLessonLocked(
  lessonId: string,
  completedLessons: string[],
): boolean {
  const lesson = getLessonById(lessonId);
  if (!lesson) return true;

  return !lesson.prerequisites.every((prereq) =>
    completedLessons.includes(prereq),
  );
}
