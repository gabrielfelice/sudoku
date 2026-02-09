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
  {
    id: "lesson_4_hidden_pairs",
    title: "Lição 4: Pares Ocultos",
    description:
      "Aprenda a encontrar dois números que só podem estar em duas células específicas dentro de uma casa.",
    objective:
      "Complete o puzzle usando pares ocultos. Um par oculto ocorre quando dois dígitos só podem estar em duas células específicas de uma casa, mesmo que essas células tenham outros candidatos.",
    puzzle: {
      given: [
        0, 2, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 8, 0, 2, 0, 0, 0, 0, 3, 7, 0,
        0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 7, 2, 0, 0, 3, 0, 0, 0, 5, 0, 0, 6, 9, 0,
        0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 5, 0, 8, 0, 0, 0, 0, 0,
        7, 0, 0, 0, 0, 0, 0, 6, 0,
      ],
      solution: [
        3, 2, 5, 6, 1, 4, 7, 8, 9, 9, 6, 7, 5, 3, 8, 1, 2, 4, 1, 8, 4, 3, 7, 2,
        6, 5, 3, 8, 1, 9, 4, 5, 6, 3, 7, 2, 4, 7, 3, 2, 9, 1, 5, 6, 8, 6, 9, 2,
        7, 8, 3, 4, 1, 5, 2, 3, 6, 1, 4, 7, 8, 9, 5, 5, 4, 1, 8, 6, 9, 2, 3, 7,
        7, 8, 9, 3, 2, 5, 1, 4, 6,
      ],
    },
    allowedTechniques: [
      "naked_single",
      "hidden_single",
      "naked_pair",
      "hidden_pair",
    ],
    prerequisites: ["lesson_3_pairs"],
  },
  {
    id: "lesson_5_pointing_pairs",
    title: "Lição 5: Pares Apontadores",
    description:
      "Aprenda a técnica de pares apontadores (pointing pairs) para eliminar candidatos.",
    objective:
      "Complete o puzzle usando pares apontadores. Quando um dígito em um bloco só pode estar em uma linha ou coluna, ele pode ser eliminado das outras células dessa linha/coluna fora do bloco.",
    puzzle: {
      given: [
        0, 0, 3, 0, 2, 0, 6, 0, 0, 9, 0, 0, 3, 0, 5, 0, 0, 1, 0, 0, 1, 8, 0, 6,
        4, 0, 0, 0, 0, 8, 1, 0, 2, 9, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 6,
        7, 0, 8, 2, 0, 0, 0, 0, 2, 6, 0, 9, 5, 0, 0, 8, 0, 0, 2, 0, 3, 0, 0, 9,
        0, 0, 5, 0, 1, 0, 3, 0, 0,
      ],
      solution: [
        4, 8, 3, 9, 2, 1, 6, 5, 7, 9, 6, 7, 3, 4, 5, 8, 2, 1, 2, 5, 1, 8, 7, 6,
        4, 9, 3, 5, 4, 8, 1, 3, 2, 9, 7, 6, 7, 2, 9, 5, 6, 4, 1, 3, 8, 1, 3, 6,
        7, 9, 8, 2, 4, 5, 3, 7, 2, 6, 8, 9, 5, 1, 4, 8, 1, 4, 2, 5, 3, 7, 6, 9,
        6, 9, 5, 4, 1, 7, 3, 8, 2,
      ],
    },
    allowedTechniques: [
      "naked_single",
      "hidden_single",
      "naked_pair",
      "pointing_pair",
    ],
    prerequisites: ["lesson_4_hidden_pairs"],
  },
  {
    id: "lesson_6_box_line_reduction",
    title: "Lição 6: Redução Bloco-Linha",
    description:
      "Domine a técnica de redução bloco-linha (box-line reduction) para eliminar candidatos de blocos.",
    objective:
      "Complete o puzzle usando redução bloco-linha. Quando um dígito em uma linha/coluna só pode estar em um bloco, ele pode ser eliminado das outras células desse bloco.",
    puzzle: {
      given: [
        0, 0, 0, 6, 0, 0, 4, 0, 0, 7, 0, 0, 0, 0, 3, 6, 0, 0, 0, 0, 0, 0, 9, 1,
        0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 5, 0, 1, 8, 6, 0, 0, 0, 0, 0, 3,
        0, 0, 0, 0, 0, 6, 0, 6, 0, 5, 0, 0, 0, 0, 9, 0, 0, 4, 0, 0, 0, 0, 3, 0,
        5, 0, 0, 0, 0, 9, 7, 0, 0,
      ],
      solution: [
        5, 8, 1, 6, 7, 2, 4, 9, 3, 7, 9, 2, 8, 4, 3, 6, 5, 1, 3, 4, 6, 5, 9, 1,
        7, 8, 2, 9, 1, 8, 7, 5, 4, 2, 6, 3, 4, 5, 7, 1, 8, 6, 9, 3, 2, 2, 3, 9,
        4, 2, 8, 5, 1, 6, 1, 6, 3, 5, 2, 7, 8, 4, 9, 8, 7, 4, 9, 1, 5, 3, 2, 6,
        5, 2, 3, 6, 4, 9, 7, 1, 8,
      ],
    },
    allowedTechniques: [
      "naked_single",
      "hidden_single",
      "pointing_pair",
      "box_line_reduction",
    ],
    prerequisites: ["lesson_5_pointing_pairs"],
  },
  {
    id: "lesson_7_naked_triples",
    title: "Lição 7: Triplas Nuas (Avançado)",
    description:
      "Técnica avançada: identifique quando três células em uma casa compartilham apenas três candidatos.",
    objective:
      "Complete o puzzle usando triplas nuas. Quando três células em uma casa contêm apenas os mesmos três candidatos (distribuídos entre elas), esses números podem ser eliminados das outras células.",
    puzzle: {
      given: [
        0, 0, 0, 0, 0, 0, 9, 0, 7, 0, 0, 0, 4, 2, 0, 1, 8, 0, 0, 0, 0, 7, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 4, 0, 7, 2, 0, 0, 0,
        6, 0, 7, 0, 0, 0, 0, 0, 0,
      ],
      solution: [
        3, 1, 2, 5, 6, 4, 9, 3, 7, 7, 5, 6, 4, 2, 9, 1, 8, 3, 4, 8, 9, 7, 3, 1,
        2, 5, 6, 9, 4, 1, 6, 5, 8, 7, 2, 3, 2, 7, 3, 9, 1, 6, 4, 5, 8, 5, 6, 8,
        2, 4, 7, 3, 9, 1, 1, 2, 5, 8, 9, 3, 6, 7, 4, 8, 3, 4, 1, 7, 2, 5, 6, 9,
        6, 9, 7, 3, 8, 5, 2, 1, 4,
      ],
    },
    allowedTechniques: [
      "naked_single",
      "hidden_single",
      "naked_pair",
      "naked_triple",
    ],
    prerequisites: ["lesson_6_box_line_reduction"],
  },
  {
    id: "lesson_8_x_wing",
    title: "Lição 8: X-Wing (Avançado)",
    description:
      "Técnica avançada de padrão: identifique formações X-Wing para eliminar candidatos.",
    objective:
      "Complete o puzzle usando X-Wing. Quando um candidato aparece em exatamente duas posições em duas linhas (ou colunas), formando um retângulo, ele pode ser eliminado das colunas (ou linhas) correspondentes.",
    puzzle: {
      given: [
        0, 0, 0, 8, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 0, 5, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 7, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0,
        0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 4, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 3, 0, 6, 0, 0, 0,
      ],
      solution: [
        2, 3, 7, 8, 4, 1, 5, 6, 9, 1, 8, 6, 7, 9, 5, 4, 3, 2, 5, 9, 4, 3, 2, 6,
        7, 8, 1, 3, 1, 5, 6, 7, 4, 8, 9, 2, 4, 6, 9, 5, 8, 2, 1, 7, 3, 7, 2, 8,
        1, 3, 9, 6, 4, 5, 6, 7, 2, 9, 1, 8, 3, 5, 4, 9, 4, 1, 2, 5, 7, 8, 6, 3,
        8, 5, 3, 4, 6, 3, 9, 2, 7,
      ],
    },
    allowedTechniques: [
      "naked_single",
      "hidden_single",
      "naked_pair",
      "pointing_pair",
      "x_wing",
    ],
    prerequisites: ["lesson_7_naked_triples"],
  },
  {
    id: "lesson_9_swordfish",
    title: "Lição 9: Swordfish (Mestre)",
    description:
      "Técnica mestre: domine o padrão Swordfish, uma extensão do X-Wing para três linhas/colunas.",
    objective:
      "Complete o puzzle usando Swordfish. Similar ao X-Wing, mas com três linhas e três colunas formando um padrão complexo de eliminação.",
    puzzle: {
      given: [
        0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 3, 5, 0, 0, 0, 0, 0, 0, 6, 0, 0,
        7, 0, 0, 7, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 4, 0, 0, 8, 0, 0, 1, 0, 0,
        0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 1, 0, 7, 8, 0, 0, 0, 5, 0, 0, 0, 0, 0,
        4, 0, 0, 0, 0, 0, 0, 2, 3,
      ],
      solution: [
        6, 7, 3, 8, 9, 4, 5, 1, 2, 9, 8, 2, 1, 3, 5, 6, 4, 7, 5, 4, 1, 6, 2, 7,
        9, 8, 3, 7, 9, 8, 2, 6, 1, 3, 5, 4, 2, 3, 5, 4, 7, 9, 8, 6, 1, 1, 2, 4,
        3, 5, 8, 7, 9, 6, 3, 6, 9, 7, 4, 2, 1, 3, 5, 8, 1, 7, 5, 8, 3, 2, 6, 9,
        4, 5, 6, 9, 1, 7, 4, 2, 3,
      ],
    },
    allowedTechniques: [
      "naked_single",
      "hidden_single",
      "naked_pair",
      "pointing_pair",
      "box_line_reduction",
      "swordfish",
    ],
    prerequisites: ["lesson_8_x_wing"],
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
