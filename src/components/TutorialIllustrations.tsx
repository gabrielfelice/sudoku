"use client";

import React from "react";
import styles from "./TutorialIllustrations.module.css";
import {
  Eraser,
  Undo2,
  Lightbulb,
  PauseCircle,
  Settings,
  Palette,
  Volume2,
  Sparkles,
  Pencil,
} from "lucide-react";

interface CellDemoProps {
  value?: number;
  notes?: number[];
  highlighted?: boolean;
  selected?: boolean;
}

function CellDemo({ value, notes, highlighted, selected }: CellDemoProps) {
  return (
    <div
      className={`${styles.cell} ${highlighted ? styles.highlighted : ""} ${selected ? styles.selected : ""}`}
    >
      {value ? (
        <span className={styles.cellValue}>{value}</span>
      ) : notes && notes.length > 0 ? (
        <div className={styles.notes}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              className={`${styles.note} ${notes.includes(n) ? styles.noteActive : ""}`}
            >
              {notes.includes(n) ? n : ""}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BoardSelectionDemo() {
  return (
    <div className={styles.demoContainer}>
      <div className={styles.miniBoard}>
        <CellDemo value={5} />
        <CellDemo value={3} />
        <CellDemo />
        <CellDemo />
        <CellDemo value={7} />
        <CellDemo />
        <CellDemo selected highlighted />
        <CellDemo />
        <CellDemo />
      </div>
      <p className={styles.demoCaption}>
        Clique em uma célula vazia para selecioná-la
      </p>
    </div>
  );
}

export function NumberInputDemo() {
  return (
    <div className={styles.demoContainer}>
      <div className={styles.miniBoard}>
        <CellDemo value={5} />
        <CellDemo value={3} />
        <CellDemo />
        <CellDemo />
        <CellDemo value={7} />
        <CellDemo />
        <CellDemo selected value={4} />
        <CellDemo />
        <CellDemo />
      </div>
      <div className={styles.keypadDemo}>
        <button className={styles.keypadButton}>1</button>
        <button className={styles.keypadButton}>2</button>
        <button className={styles.keypadButton}>3</button>
        <button className={`${styles.keypadButton} ${styles.active}`}>4</button>
        <button className={styles.keypadButton}>5</button>
        <button className={styles.keypadButton}>6</button>
        <button className={styles.keypadButton}>7</button>
        <button className={styles.keypadButton}>8</button>
        <button className={styles.keypadButton}>9</button>
      </div>
      <p className={styles.demoCaption}>
        Use o teclado numérico ou clique nos botões
      </p>
    </div>
  );
}

export function NoteModeDemo() {
  return (
    <div className={styles.demoContainer}>
      <div className={styles.miniBoard}>
        <CellDemo value={5} />
        <CellDemo value={3} />
        <CellDemo notes={[1, 2, 6]} />
        <CellDemo />
        <CellDemo value={7} />
        <CellDemo />
        <CellDemo selected notes={[4, 8, 9]} />
        <CellDemo />
        <CellDemo />
      </div>
      <div className="flex gap-4 items-center justify-center p-4">
        <button className="p-3 rounded-lg bg-gray-200 text-gray-800">
          <Pencil className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium">Modo Normal</span>
        <span className="text-2xl">→</span>
        <button className="p-3 rounded-lg bg-green-600 text-white ring-2 ring-green-400">
          <Pencil className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium text-green-700">Modo Notas</span>
      </div>
      <p className={styles.demoCaption}>
        Ative o modo notas para adicionar candidatos
      </p>
    </div>
  );
}

export function HintSystemDemo() {
  return (
    <div className={styles.demoContainer}>
      <div className={styles.hintPanel}>
        <div className={styles.hintIcon}>
          <Lightbulb className="w-8 h-8 text-yellow-500" />
        </div>
        <div className={styles.hintContent}>
          <h4>Naked Single</h4>
          <p>
            A célula (3, 7) tem apenas um candidato possível: <strong>4</strong>
          </p>
        </div>
      </div>
      <p className={styles.demoCaption}>
        Dicas explicam a lógica por trás de cada movimento
      </p>
    </div>
  );
}

export function PauseModeDemo() {
  return (
    <div className={styles.demoContainer}>
      <div className={styles.pauseOverlay}>
        <div className={styles.pauseIcon}>
          <PauseCircle className="w-12 h-12 text-white" />
        </div>
        <h3>Jogo Pausado</h3>
        <p>O tabuleiro está oculto</p>
        <button className={styles.resumeButton}>Retomar</button>
      </div>
      <p className={styles.demoCaption}>
        Pause para esconder o tabuleiro e pausar o cronômetro
      </p>
    </div>
  );
}

export function SettingsDemo() {
  return (
    <div className={styles.demoContainer}>
      <div className={styles.settingsPanel}>
        <div className={styles.settingRow}>
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4" /> Tema
          </span>
          <select className={styles.settingSelect}>
            <option>Claro</option>
            <option>Escuro</option>
            <option>Oceano</option>
          </select>
        </div>
        <div className={styles.settingRow}>
          <span className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> Sons
          </span>
          <div className={styles.settingToggle}>ON</div>
        </div>
        <div className={styles.settingRow}>
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Destaque de erros
          </span>
          <div className={styles.settingToggle}>ON</div>
        </div>
      </div>
      <p className={styles.demoCaption}>
        Personalize sua experiência nas configurações
      </p>
    </div>
  );
}

export function UndoEraseDemo() {
  return (
    <div className={styles.demoContainer}>
      <div className={styles.actionButtons}>
        <button
          className={`${styles.actionButton} flex flex-col items-center gap-1 p-2`}
        >
          <span className={styles.buttonIcon}>
            <Eraser className="w-6 h-6" />
          </span>
          <span className="text-xs">Borracha</span>
        </button>
        <button
          className={`${styles.actionButton} flex flex-col items-center gap-1 p-2`}
        >
          <span className={styles.buttonIcon}>
            <Undo2 className="w-6 h-6" />
          </span>
          <span className="text-xs">Desfazer</span>
        </button>
      </div>
      <p className={styles.demoCaption}>
        Apague células ou desfaça movimentos anteriores
      </p>
    </div>
  );
}
