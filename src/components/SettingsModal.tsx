"use client";

import React, { useState, useEffect } from "react";
import { useGameStore } from "@/state/store";
import { useProfileStore } from "@/state/profileStore";
import {
  useCustomizationStore,
  commitCustomization,
} from "@/state/customizationStore";
import { PlayerConfig, ThemeConfig, createDefaultTheme } from "@/state/types";
import { SudokuPreview } from "./SudokuPreview";
import { Switch } from "./Switch";
import { getItemById, getThemeConfig } from "@/lib/shop";
import {
  loadPresets,
  savePreset,
  deletePreset,
  getPresetCount,
  canSaveMorePresets,
} from "@/lib/presets";
import {
  getAvailableAvatars,
  getAvatarById,
  AVATAR_PACKS,
} from "@/lib/avatars";

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
    ...createDefaultTheme(),
    selectedCellBg: "#ffeb3b",
    peerCellBg: "#fff9c4",
    sameNumberOutline: "#000000",
    hintPrimaryBg: "#ffd54f",
    hintSecondaryBg: "#ffe082",
  },
  "color-blind": {
    ...createDefaultTheme(),
    selectedCellBg: "#b3e5fc",
    peerCellBg: "#e1f5fe",
    sameNumberOutline: "#0277bd",
    correctNumberColor: "#0277bd",
    wrongNumberColor: "#f57c00",
  },
  "noite-suave": {
    ...createDefaultTheme(),
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
    ...createDefaultTheme(),
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
    ...createDefaultTheme(),
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
  const profile = useProfileStore((s) => s.profile);
  const setAvatar = useProfileStore((s) => s.setAvatar);
  const purchaseItem = useProfileStore((s) => s.purchaseItem);

  const {
    draftConfig,
    draftTheme,
    draftAvatar,
    customColorUsage,
    contrastValidation,
    initializeDraft,
    updateDraftConfig,
    updateDraftTheme,
    updateDraftAvatar,
    validateContrast,
    resetDraft,
  } = useCustomizationStore();

  const [activeTab, setActiveTab] = useState<
    "config" | "theme" | "appearance" | "avatar"
  >("config");
  const [selectedPreset, setSelectedPreset] = useState<PresetTheme>("default");
  const [savedPresets, setSavedPresets] = useState(loadPresets());
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  // Initialize draft when modal opens
  useEffect(() => {
    if (isOpen) {
      const isPremium = profile.inventory.themes.length > 0;
      initializeDraft(config, theme, profile.avatar, isPremium);
      setSavedPresets(loadPresets());
    }
  }, [
    isOpen,
    config,
    theme,
    profile.avatar,
    profile.inventory.themes.length,
    initializeDraft,
  ]);

  if (!isOpen || !draftConfig || !draftTheme) return null;

  const handleConfigChange = (key: keyof PlayerConfig, value: any) => {
    updateDraftConfig({ [key]: value });
  };

  const handleThemeChange = (key: keyof ThemeConfig, value: string) => {
    updateDraftTheme({ [key]: value });
  };

  const handlePresetChange = (preset: PresetTheme) => {
    setSelectedPreset(preset);
    updateDraftTheme(PRESET_THEMES[preset]);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    if (!draftConfig || !draftTheme) return;

    savePreset(presetName.trim(), draftConfig, draftTheme);
    setSavedPresets(loadPresets());
    setPresetName("");
    setShowPresetInput(false);

    dispatch({
      type: "SET_TOAST",
      message: "Preset salvo com sucesso!",
      toastType: "success",
    });
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = savedPresets.find((p) => p.id === presetId);
    if (!preset) return;

    updateDraftConfig(preset.config);
    updateDraftTheme(preset.theme);

    dispatch({
      type: "SET_TOAST",
      message: `Preset "${preset.name}" aplicado!`,
      toastType: "success",
    });
  };

  const handleDeletePreset = (presetId: string) => {
    deletePreset(presetId);
    setSavedPresets(loadPresets());

    dispatch({
      type: "SET_TOAST",
      message: "Preset removido!",
      toastType: "info",
    });
  };

  const handleAvatarSelect = (avatarId: string) => {
    updateDraftAvatar(avatarId);
  };

  const handlePurchaseAvatarPack = (packId: string, price: number) => {
    const success = purchaseItem(packId, price, "avatarPacks");
    if (success) {
      dispatch({
        type: "SET_TOAST",
        message: "Pack de avatares comprado!",
        toastType: "success",
      });
    } else {
      dispatch({
        type: "SET_TOAST",
        message: "Moedas insuficientes!",
        toastType: "error",
      });
    }
  };

  const handleSave = () => {
    // Check contrast validation
    if (contrastValidation && !contrastValidation.isValid) {
      dispatch({
        type: "SET_TOAST",
        message: "Corrija os problemas de contraste antes de salvar!",
        toastType: "error",
      });
      return;
    }

    commitCustomization(draftConfig, draftTheme, dispatch);

    // Save avatar
    if (draftAvatar) {
      setAvatar(draftAvatar);
    }

    resetDraft();

    dispatch({
      type: "SET_TOAST",
      message: "Personalização salva com sucesso!",
      toastType: "success",
    });

    onClose();
  };

  const handleCancel = () => {
    resetDraft();
    onClose();
  };

  const availableAvatars = getAvailableAvatars(profile.inventory.avatarPacks);
  const isPremium = customColorUsage?.isPremium || false;
  const colorUsageText = isPremium
    ? "✨ Cores ilimitadas"
    : `${customColorUsage?.usedColors.length || 0}/${customColorUsage?.maxFreeColors || 3} cores gratuitas usadas`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Personalização</h2>
            <button
              onClick={handleCancel}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Split layout: Settings (left) + Preview (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings Panel */}
            <div>
              {/* Tabs */}
              <div className="mb-6 flex gap-2 border-b overflow-x-auto">
                <button
                  onClick={() => setActiveTab("config")}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    activeTab === "config"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  Jogabilidade
                </button>
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    activeTab === "appearance"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  Aparência
                </button>
                <button
                  onClick={() => setActiveTab("theme")}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    activeTab === "theme"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  Tema
                </button>
                <button
                  onClick={() => setActiveTab("avatar")}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    activeTab === "avatar"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  Avatar
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
                    <Switch
                      checked={draftConfig.autoLockOnCorrect}
                      onChange={(checked) =>
                        handleConfigChange("autoLockOnCorrect", checked)
                      }
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
                    <Switch
                      checked={draftConfig.autoRemoveNotes}
                      onChange={(checked) =>
                        handleConfigChange("autoRemoveNotes", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        Auto-limpar notas inválidas
                      </h3>
                      <p className="text-sm text-gray-600">
                        Remover automaticamente notas que violam regras do
                        Sudoku
                      </p>
                    </div>
                    <Switch
                      checked={draftConfig.autoCleanInvalidNotes}
                      onChange={(checked) =>
                        handleConfigChange("autoCleanInvalidNotes", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        Destacar conflitos ao vivo
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mostrar conflitos em tempo real enquanto digita
                      </p>
                    </div>
                    <Switch
                      checked={draftConfig.liveConflictHighlight}
                      onChange={(checked) =>
                        handleConfigChange("liveConflictHighlight", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        Mostrar destaque de mesmo número
                      </h3>
                      <p className="text-sm text-gray-600">
                        Destacar células com o mesmo número da célula
                        selecionada
                      </p>
                    </div>
                    <Switch
                      checked={draftConfig.showSameNumberHighlight}
                      onChange={(checked) =>
                        handleConfigChange("showSameNumberHighlight", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Mostrar destaque de peers</h3>
                      <p className="text-sm text-gray-600">
                        Destacar linha, coluna e bloco da célula selecionada
                      </p>
                    </div>
                    <Switch
                      checked={draftConfig.showPeerHighlight}
                      onChange={(checked) =>
                        handleConfigChange("showPeerHighlight", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Ativar sons</h3>
                      <p className="text-sm text-gray-600">
                        Reproduzir efeitos sonoros durante o jogo
                      </p>
                    </div>
                    <Switch
                      checked={draftConfig.soundEnabled}
                      onChange={(checked) =>
                        handleConfigChange("soundEnabled", checked)
                      }
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
                        draftConfig.maxErrors === null
                          ? "unlimited"
                          : draftConfig.maxErrors
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
                      <option value="1">1</option>
                      <option value="3">3</option>
                      <option value="5">5</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Ativar itens de ajuda</h3>
                      <p className="text-sm text-gray-600">
                        Permitir uso de itens de ajuda comprados na loja
                      </p>
                    </div>
                    <Switch
                      checked={draftConfig.helpEnabled}
                      onChange={(checked) =>
                        handleConfigChange("helpEnabled", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Limite de dicas (Expert)</h3>
                      <p className="text-sm text-gray-600">
                        Máximo de dicas permitidas em puzzles Expert (1-3)
                      </p>
                    </div>
                    <select
                      value={draftConfig.expertHintLimit}
                      onChange={(e) =>
                        handleConfigChange(
                          "expertHintLimit",
                          parseInt(e.target.value),
                        )
                      }
                      className="rounded border px-3 py-1"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Mostrar ícone de cadeado</h3>
                      <p className="text-sm text-gray-600">
                        Exibir ícone 🔒 em células travadas
                      </p>
                    </div>
                    <Switch
                      checked={draftConfig.showLockIcon}
                      onChange={(checked) =>
                        handleConfigChange("showLockIcon", checked)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Appearance Tab - Milestone M */}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 font-medium text-lg">Fundo Global</h3>
                    <div className="space-y-2">
                      <label className="block text-sm">
                        Cor de fundo da página
                      </label>
                      <input
                        type="color"
                        value={draftTheme.globalBackground || "#f5f5f5"}
                        onChange={(e) =>
                          handleThemeChange("globalBackground", e.target.value)
                        }
                        className="h-12 w-full rounded border cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="mb-3 font-medium text-lg">Células</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-2">
                          Fundo das células
                        </label>
                        <input
                          type="color"
                          value={draftTheme.cellBackground || "#ffffff"}
                          onChange={(e) =>
                            handleThemeChange("cellBackground", e.target.value)
                          }
                          className="h-12 w-full rounded border cursor-pointer"
                        />
                        {contrastValidation && !contrastValidation.isValid && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                            <div className="flex items-start gap-2">
                              <span className="text-red-600">⚠️</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">
                                  Contraste insuficiente
                                </p>
                                <ul className="mt-1 text-xs text-red-700 space-y-1">
                                  {contrastValidation.failedColors.map(
                                    (fail, idx) => (
                                      <li key={idx}>
                                        • {fail.label}: {fail.ratio.toFixed(2)}
                                        :1 (mínimo 4.5:1)
                                      </li>
                                    ),
                                  )}
                                </ul>
                                <p className="mt-2 text-xs text-red-600">
                                  Sugerimos usar cores mais claras ou mais
                                  escuras para melhor contraste.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {contrastValidation && contrastValidation.isValid && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-xs text-green-700">
                              ✓ Contraste adequado (WCAG AA)
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm mb-2">
                          Borda das células
                        </label>
                        <input
                          type="color"
                          value={draftTheme.cellBorder || "#e0e0e0"}
                          onChange={(e) =>
                            handleThemeChange("cellBorder", e.target.value)
                          }
                          className="h-12 w-full rounded border cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Theme Tab - Enhanced with Presets */}
              {activeTab === "theme" && (
                <div className="space-y-6">
                  {/* Saved Presets - Milestone M */}
                  {savedPresets.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-medium text-lg">
                        🎨 Meus Presets
                      </h3>
                      <div className="space-y-2">
                        {savedPresets.map((preset) => (
                          <div
                            key={preset.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{preset.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  preset.timestamp,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleLoadPreset(preset.id)}
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Aplicar
                              </button>
                              <button
                                onClick={() => handleDeletePreset(preset.id)}
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {getPresetCount()}/10 presets salvos
                      </div>
                    </div>
                  )}

                  {/* Save Current Preset */}
                  <div className="border-t pt-4">
                    {!showPresetInput ? (
                      <button
                        onClick={() => setShowPresetInput(true)}
                        disabled={!canSaveMorePresets()}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {canSaveMorePresets()
                          ? "💾 Salvar Preset Atual"
                          : "Limite de presets atingido (10/10)"}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          placeholder="Nome do preset..."
                          className="w-full px-3 py-2 border rounded"
                          maxLength={30}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSavePreset}
                            disabled={!presetName.trim()}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setShowPresetInput(false);
                              setPresetName("");
                            }}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Color Usage Indicator - Milestone M */}
                  <div className="border-t pt-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-medium text-blue-900">
                        {colorUsageText}
                      </p>
                      {!isPremium && (
                        <p className="text-xs text-blue-700 mt-1">
                          Compre qualquer tema na loja para desbloquear cores
                          ilimitadas!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Purchased Themes */}
                  {profile.inventory.themes.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="mb-2 font-medium">🛒 Temas Comprados</h3>
                      <div className="flex gap-2 flex-wrap">
                        {profile.inventory.themes.map((themeId) => {
                          const item = getItemById(themeId);
                          if (!item) return null;
                          return (
                            <button
                              key={themeId}
                              onClick={() => {
                                const themeConfig = getThemeConfig(themeId);
                                if (themeConfig) {
                                  updateDraftTheme(themeConfig);
                                }
                              }}
                              className="rounded px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 font-medium"
                            >
                              ✨ {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Preset Themes */}
                  <div className="border-t pt-4">
                    <h3 className="mb-2 font-medium">Temas Predefinidos</h3>
                    <div className="flex gap-2 flex-wrap">
                      {(Object.keys(PRESET_THEMES) as PresetTheme[]).map(
                        (key) => (
                          <button
                            key={key}
                            onClick={() => handlePresetChange(key)}
                            className={`rounded px-4 py-2 ${
                              selectedPreset === key
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            {key === "default" && "Padrão"}
                            {key === "high-contrast" && "Alto Contraste"}
                            {key === "color-blind" && "Daltônico"}
                            {key === "noite-suave" && "Noite Suave"}
                            {key === "pastel" && "Pastel"}
                            {key === "neon-clean" && "Neon Clean"}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Manual Customization */}
                  <div className="border-t pt-4">
                    <h3 className="mb-4 font-medium">Personalização Manual</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm">
                          Célula selecionada
                        </label>
                        <input
                          type="color"
                          value={draftTheme.selectedCellBg}
                          onChange={(e) =>
                            handleThemeChange("selectedCellBg", e.target.value)
                          }
                          className="h-10 w-full rounded border"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          Células peers
                        </label>
                        <input
                          type="color"
                          value={draftTheme.peerCellBg}
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
                          value={draftTheme.sameNumberOutline}
                          onChange={(e) =>
                            handleThemeChange(
                              "sameNumberOutline",
                              e.target.value,
                            )
                          }
                          className="h-10 w-full rounded border"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          Número correto
                        </label>
                        <input
                          type="color"
                          value={draftTheme.correctNumberColor}
                          onChange={(e) =>
                            handleThemeChange(
                              "correctNumberColor",
                              e.target.value,
                            )
                          }
                          className="h-10 w-full rounded border"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          Número errado
                        </label>
                        <input
                          type="color"
                          value={draftTheme.wrongNumberColor}
                          onChange={(e) =>
                            handleThemeChange(
                              "wrongNumberColor",
                              e.target.value,
                            )
                          }
                          className="h-10 w-full rounded border"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          Número dado
                        </label>
                        <input
                          type="color"
                          value={draftTheme.givenNumberColor}
                          onChange={(e) =>
                            handleThemeChange(
                              "givenNumberColor",
                              e.target.value,
                            )
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
                          value={draftTheme.boardBorder}
                          onChange={(e) =>
                            handleThemeChange("boardBorder", e.target.value)
                          }
                          className="h-10 w-full rounded border"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          Dica primária
                        </label>
                        <input
                          type="color"
                          value={draftTheme.hintPrimaryBg}
                          onChange={(e) =>
                            handleThemeChange("hintPrimaryBg", e.target.value)
                          }
                          className="h-10 w-full rounded border"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm">
                          Dica secundária
                        </label>
                        <input
                          type="color"
                          value={draftTheme.hintSecondaryBg}
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

              {/* Avatar Tab - Milestone M */}
              {activeTab === "avatar" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 font-medium text-lg">
                      Avatares Gratuitos
                    </h3>
                    <div className="grid grid-cols-5 gap-3">
                      {availableAvatars
                        .filter((a) => !a.isPremium)
                        .map((avatar) => (
                          <button
                            key={avatar.id}
                            onClick={() => handleAvatarSelect(avatar.id)}
                            className={`text-4xl p-3 rounded-lg border-2 hover:scale-110 transition-transform ${
                              draftAvatar === avatar.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            title={avatar.id}
                          >
                            {avatar.emoji}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Premium Avatar Packs */}
                  <div className="border-t pt-6">
                    <h3 className="mb-3 font-medium text-lg">Packs Premium</h3>
                    <div className="space-y-4">
                      {AVATAR_PACKS.map((pack) => {
                        const owned = profile.inventory.avatarPacks.includes(
                          pack.id,
                        );
                        return (
                          <div key={pack.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{pack.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {pack.description}
                                </p>
                              </div>
                              {owned ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded">
                                  ✓ Comprado
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handlePurchaseAvatarPack(
                                      pack.id,
                                      pack.price,
                                    )
                                  }
                                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium"
                                >
                                  {pack.price} 🪙
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                              {pack.avatars.slice(0, 6).map((avatar) => (
                                <button
                                  key={avatar.id}
                                  onClick={() =>
                                    owned && handleAvatarSelect(avatar.id)
                                  }
                                  disabled={owned ? undefined : true}
                                  className={`text-2xl p-2 rounded border ${
                                    owned
                                      ? draftAvatar === avatar.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300 hover:scale-110 transition-transform"
                                      : "border-gray-200 opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  {owned ? avatar.emoji : "🔒"}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="flex flex-col items-center justify-start sticky top-0">
              <SudokuPreview theme={draftTheme} config={draftConfig} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="rounded bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={contrastValidation && !contrastValidation.isValid}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Salvar Personalização
          </button>
        </div>
      </div>
    </div>
  );
}
