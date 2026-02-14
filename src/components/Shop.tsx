"use client";

import { useState } from "react";
import { useGameStore } from "@/state/store";
import { useProfileStore } from "@/state/profileStore";
import {
  SHOP_CATALOG,
  SHOP_PACKAGES,
  getItemPrice,
  canPurchase,
  canPurchasePackage,
  calculatePackageValue,
  ShopItem,
  ShopPackage,
} from "@/lib/shop";

interface ShopProps {
  onClose: () => void;
}

export function Shop({ onClose }: ShopProps) {
  const difficulty = useGameStore((s) => s.difficulty);
  const config = useGameStore((s) => s.config);
  const profile = useProfileStore((s) => s.profile);
  const purchaseItem = useProfileStore((s) => s.purchaseItem);
  const purchasePackage = useProfileStore((s) => s.purchasePackage);
  const dispatch = useGameStore((s) => s.dispatch);

  const [activeTab, setActiveTab] = useState<"items" | "packages">("items");

  const handlePurchase = (item: ShopItem) => {
    const price = getItemPrice(item, difficulty);
    const category =
      item.category === "help"
        ? "helpItems"
        : item.category === "theme"
          ? "themes"
          : "avatarPacks";

    const success = purchaseItem(item.id, price, category);

    if (success) {
      dispatch({
        type: "SET_TOAST",
        message: `Purchased ${item.name}!`,
        toastType: "success",
      });
    } else {
      dispatch({
        type: "SET_TOAST",
        message: "Insufficient coins",
        toastType: "error",
      });
    }
  };

  const handlePackagePurchase = (pkg: ShopPackage) => {
    const success = purchasePackage(pkg.id, pkg.price, pkg.items);

    if (success) {
      dispatch({
        type: "SET_TOAST",
        message: `Purchased ${pkg.name}!`,
        toastType: "success",
      });
    } else {
      dispatch({
        type: "SET_TOAST",
        message: "Insufficient coins or max quantity reached",
        toastType: "error",
      });
    }
  };

  const helpItems = SHOP_CATALOG.filter((item) => item.category === "help");
  const themeItems = SHOP_CATALOG.filter((item) => item.category === "theme");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Shop</h2>
              <p className="text-blue-100 mt-1">
                Purchase items and packages with your coins
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Your Balance</div>
              <div className="text-4xl font-bold flex items-center gap-2">
                <span>🪙</span>
                <span>{profile.coins}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("items")}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                activeTab === "items"
                  ? "bg-white text-blue-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Individual Items
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                activeTab === "packages"
                  ? "bg-white text-purple-600"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              📦 Packages (Save up to 40%!)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "items" ? (
            <>
              {/* Help Items Section */}
              <section className="mb-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>🛠️</span>
                  <span>Help Items (Consumable)</span>
                </h3>
                {!config.helpEnabled && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Help items are currently disabled in settings. Enable
                      them to use purchased items.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {helpItems.map((item) => {
                    const price = getItemPrice(item, difficulty);
                    const quantity = profile.inventory.helpItems[item.id] || 0;
                    const purchaseCheck = canPurchase(
                      item,
                      profile.coins,
                      difficulty,
                      profile.inventory.helpItems,
                    );

                    return (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 bg-white border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">{item.name}</h4>
                          {item.tier === "premium" && (
                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                        {quantity > 0 && (
                          <div className="text-sm text-green-600 font-semibold mb-2">
                            ✓ Owned: {quantity}x
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <span>🪙</span>
                            <span>{price}</span>
                            {difficulty !== "easy" && (
                              <span className="text-xs text-gray-500">
                                ({difficulty})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handlePurchase(item)}
                            disabled={!purchaseCheck.canPurchase}
                            className={`px-4 py-2 rounded font-semibold ${
                              purchaseCheck.canPurchase
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {purchaseCheck.canPurchase
                              ? "Buy 1x"
                              : purchaseCheck.reason}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Theme Items Section */}
              <section>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>🎨</span>
                  <span>Themes (Permanent)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {themeItems.map((item) => {
                    const price = getItemPrice(item, difficulty);
                    const owned = profile.inventory.themes.includes(item.id);
                    const purchaseCheck = canPurchase(
                      item,
                      profile.coins,
                      difficulty,
                      profile.inventory.helpItems, // Not used for themes
                    );

                    return (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-4 ${
                          owned
                            ? "bg-green-50 border-green-300"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <h4 className="font-bold text-lg mb-2">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {item.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <span>🪙</span>
                            <span>{price}</span>
                          </div>
                          {owned ? (
                            <span className="text-green-600 font-semibold">
                              ✓ Owned
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePurchase(item)}
                              disabled={!purchaseCheck.canPurchase}
                              className={`px-4 py-2 rounded font-semibold ${
                                purchaseCheck.canPurchase
                                  ? "bg-blue-500 text-white hover:bg-blue-600"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {purchaseCheck.canPurchase
                                ? "Buy"
                                : purchaseCheck.reason}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            /* Packages Section */
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>📦</span>
                <span>Value Packages</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHOP_PACKAGES.map((pkg) => {
                  const totalValue = calculatePackageValue(pkg, difficulty);
                  const purchaseCheck = canPurchasePackage(
                    pkg,
                    profile.coins,
                    profile.inventory.helpItems,
                  );

                  return (
                    <div
                      key={pkg.id}
                      className="border-2 border-purple-300 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-xl">{pkg.name}</h4>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">
                          Save {pkg.savings}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {pkg.description}
                      </p>

                      {/* Package Contents */}
                      <div className="bg-white rounded p-3 mb-3 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 mb-2">
                          INCLUDES:
                        </div>
                        {pkg.items.map((item) => {
                          const shopItem = SHOP_CATALOG.find(
                            (i) => i.id === item.itemId,
                          );
                          return (
                            <div
                              key={item.itemId}
                              className="text-sm text-gray-700 flex justify-between"
                            >
                              <span>• {shopItem?.name}</span>
                              <span className="font-semibold">
                                {item.quantity}x
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pricing */}
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="text-xs text-gray-500 line-through">
                            🪙 {totalValue} (regular price)
                          </div>
                          <div className="text-2xl font-bold text-purple-600 flex items-center gap-1">
                            <span>🪙</span>
                            <span>{pkg.price}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-600 font-semibold">
                            You save
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            🪙 {totalValue - pkg.price}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePackagePurchase(pkg)}
                        disabled={!purchaseCheck.canPurchase}
                        className={`w-full px-4 py-3 rounded-lg font-bold text-lg ${
                          purchaseCheck.canPurchase
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {purchaseCheck.canPurchase
                          ? "Buy Package"
                          : purchaseCheck.reason}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
