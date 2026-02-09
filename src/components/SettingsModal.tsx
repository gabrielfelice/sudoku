"use client";

import React, { useState } from "react";
import { useGameStore } from "@/state/store";
import { PlayerConfig, ThemeConfig, createDefaultTheme } from "@/state/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PresetTheme =
  | "default"
  | "high-contrast"
  | "color-blind"
  | "noite-suave"
  | "pastel"
  | "neon-clean";

const PRESET_THEMES: Record<PresetTheme, ThemeConfig> = {
  default: createDefaultTheme(),
  "high-contrast": {
    selectedCellBg: "#ffeb3b",
    peerCellBg: "#fff9c4",
    sameNumberOutline: "#000000",
    correctNumberColor: "#1976d2",
    wrongNumberColor: "#d32f2f",
    givenNumberColor: "#000000",
    boardBorder: "#000000",
    hintPrimaryBg: "#ffd54f",
    hintSecondaryBg: "#ffe082",
  },
  "color-blind": {
    selectedCellBg: "#b3e5fc",
    peerCellBg: "#e1f5fe",
    sameNumberOutline: "#0277bd",
    correctNumberColor: "#0277bd",
    wrongNumberColor: "#f57c00",
    givenNumberColor: "#000000",
    boardBorder: "#000000",
    hintPrimaryBg: "#fff9c4",
    hintSecondaryBg: "#fff59d",
  },
  "noite-suave": {
    selectedCellBg: "#7c3aed",
    peerCellBg: "#ddd6fe",
    sameNumberOutline: "#6d28d9",
    correctNumberColor: "#8b5cf6",
    wrongNumberColor: "#f87171",
    givenNumberColor: "#1f2937",
    boardBorder: "#4c1d95",
    hintPrimaryBg: "#c4b5fd",
    hintSecondaryBg: "#ddd6fe",
  },
  pastel: {
    selectedCellBg: "#fecaca",
    peerCellBg: "#fef3c7",
    sameNumberOutline: "#fb923c",
    correctNumberColor: "#10b981",
    wrongNumberColor: "#f87171",
    givenNumberColor: "#374151",
    boardBorder: "#f97316",
    hintPrimaryBg: "#fed7aa",
    hintSecondaryBg: "#fef3c7",
  },
  "neon-clean": {
    selectedCellBg: "#22d3ee",
    peerCellBg: "#1e293b",
    sameNumberOutline: "#06b6d4",
    correctNumberColor: "#10b981",
    wrongNumberColor: "#f43f5e",
    givenNumberColor: "#e2e8f0",
    boardBorder: "#0891b2",
    hintPrimaryBg: "#0e7490",
    hintSecondaryBg: "#155e75",
  },
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const config = useGameStore((s) => s.config);
  const theme = useGameStore((s) => s.theme);
  const dispatch = useGameStore((s) => s.dispatch);

  const [activeTab, setActiveTab] = useState<"config" | "theme">("config");
  const [selectedPreset, setSelectedPreset] = useState<PresetTheme>("default");

  if (!isOpen) return null;

  const handleConfigChange = (key: keyof PlayerConfig, value: any) => {
    dispatch({
      type: "SET_CONFIG",
      config: { [key]: value },
    });
  };

  const handleThemeChange = (key: keyof ThemeConfig, value: string) => {
    dispatch({
      type: "SET_THEME",
      theme: { [key]: value },
    });
  };

  const handlePresetChange = (preset: PresetTheme) => {
    setSelectedPreset(preset);
    dispatch({
      type: "SET_THEME",
      theme: PRESET_THEMES[preset],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Configurações</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("config")}
            className={`px-4 py-2 font-medium ${
              activeTab === "config"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Jogabilidade
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`px-4 py-2 font-medium ${
              activeTab === "theme"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Tema
          </button>
        </div>

        {/* Config Tab */}
        {activeTab === "config" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-travar ao acertar</h3>
                <p className="text-sm text-gray-600">
                  Travar células automaticamente quando acertar o número
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.autoLockOnCorrect}
                onChange={(e) =>
                  handleConfigChange("autoLockOnCorrect", e.target.checked)
                }
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-remover notas</h3>
                <p className="text-sm text-gray-600">
                  Remover automaticamente o dígito das notas dos peers ao
                  acertar
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.autoRemoveNotes}
                onChange={(e) =>
                  handleConfigChange("autoRemoveNotes", e.target.checked)
                }
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-limpar notas inválidas</h3>
                <p className="text-sm text-gray-600">
                  Remover automaticamente notas que violam regras do Sudoku
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.autoCleanInvalidNotes}
                onChange={(e) =>
                  handleConfigChange("autoCleanInvalidNotes", e.target.checked)
                }
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Destacar conflitos ao vivo</h3>
                <p className="text-sm text-gray-600">
                  Mostrar conflitos em tempo real enquanto digita
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.liveConflictHighlight}
                onChange={(e) =>
                  handleConfigChange("liveConflictHighlight", e.target.checked)
                }
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  Mostrar destaque de mesmo número
                </h3>
                <p className="text-sm text-gray-600">
                  Destacar células com o mesmo número da célula selecionada
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.showSameNumberHighlight}
                onChange={(e) =>
                  handleConfigChange(
                    "showSameNumberHighlight",
                    e.target.checked,
                  )
                }
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Mostrar destaque de peers</h3>
                <p className="text-sm text-gray-600">
                  Destacar linha, coluna e bloco da célula selecionada
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.showPeerHighlight}
                onChange={(e) =>
                  handleConfigChange("showPeerHighlight", e.target.checked)
                }
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Ativar sons</h3>
                <p className="text-sm text-gray-600">
                  Reproduzir efeitos sonoros durante o jogo
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.soundEnabled}
                onChange={(e) =>
                  handleConfigChange("soundEnabled", e.target.checked)
                }
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Limite de erros</h3>
                <p className="text-sm text-gray-600">
                  Número máximo de erros permitidos por partida
                </p>
              </div>
              <select
                value={
                  config.maxErrors === null ? "unlimited" : config.maxErrors
                }
                onChange={(e) =>
                  handleConfigChange(
                    "maxErrors",
                    e.target.value === "unlimited"
                      ? null
                      : parseInt(e.target.value),
                  )
                }
                className="rounded border px-3 py-1"
              >
                <option value="unlimited">Ilimitado</option>
                <option value="3">3</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === "theme" && (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">Temas Predefinidos</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handlePresetChange("default")}
                  className={`rounded px-4 py-2 ${
                    selectedPreset === "default"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Padrão
                </button>
                <button
                  onClick={() => handlePresetChange("high-contrast")}
                  className={`rounded px-4 py-2 ${
                    selectedPreset === "high-contrast"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Alto Contraste
                </button>
                <button
                  onClick={() => handlePresetChange("color-blind")}
                  className={`rounded px-4 py-2 ${
                    selectedPreset === "color-blind"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Daltônico
                </button>
                <button
                  onClick={() => handlePresetChange("noite-suave")}
                  className={`rounded px-4 py-2 ${
                    selectedPreset === "noite-suave"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Noite Suave
                </button>
                <button
                  onClick={() => handlePresetChange("pastel")}
                  className={`rounded px-4 py-2 ${
                    selectedPreset === "pastel"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Pastel
                </button>
                <button
                  onClick={() => handlePresetChange("neon-clean")}
                  className={`rounded px-4 py-2 ${
                    selectedPreset === "neon-clean"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Neon Clean
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-4 font-medium">Personalização Manual</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm">
                    Célula selecionada
                  </label>
                  <input
                    type="color"
                    value={theme.selectedCellBg}
                    onChange={(e) =>
                      handleThemeChange("selectedCellBg", e.target.value)
                    }
                    className="h-10 w-full rounded border"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Células peers</label>
                  <input
                    type="color"
                    value={theme.peerCellBg}
                    onChange={(e) =>
                      handleThemeChange("peerCellBg", e.target.value)
                    }
                    className="h-10 w-full rounded border"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">
                    Contorno mesmo número
                  </label>
                  <input
                    type="color"
                    value={theme.sameNumberOutline}
                    onChange={(e) =>
                      handleThemeChange("sameNumberOutline", e.target.value)
                    }
                    className="h-10 w-full rounded border"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Número correto</label>
                  <input
                    type="color"
                    value={theme.correctNumberColor}
                    onChange={(e) =>
                      handleThemeChange("correctNumberColor", e.target.value)
                    }
                    className="h-10 w-full rounded border"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Número errado</label>
                  <input
                    type="color"
                    value={theme.wrongNumberColor}
                    onChange={(e) =>
                      handleThemeChange("wrongNumberColor", e.target.value)
                    }
                    className="h-10 w-full rounded border"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Número dado</label>
                  <input
                    type="color"
                    value={theme.givenNumberColor}
                    onChange={(e) =>
                      handleThemeChange("givenNumberColor", e.target.value)
                    }
                    className="h-10 w-full rounded border"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">
                    Borda do tabuleiro
                  </label>
                  <input
                    type="color"
                    value={theme.boardBorder}
                    onChange={(e) =>
                      handleThemeChange("boardBorder", e.target.value)
                    }
                    className="h-10 w-full rounded border"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Dica primária</label>
                  <input
                    type="color"
                    value={theme.hintPrimaryBg}
                    onChange={(e) =>
                      handleThemeChange("hintPrimaryBg", e.target.value)
                    }
                    className="h-10 w-full rounded border"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Dica secundária</label>
                  <input
                    type="color"
                    value={theme.hintSecondaryBg}
                    onChange={(e) =>
                      handleThemeChange("hintSecondaryBg", e.target.value)
                    }
                    className="h-10 w-full rounded border"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
