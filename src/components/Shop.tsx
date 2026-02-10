"use client";

import { useState } from "react";
import { useGameStore } from "@/state/store";
import { useProfileStore } from "@/state/profileStore";
import { SHOP_CATALOG, getItemPrice, canPurchase, ShopItem } from "@/lib/shop";

interface ShopProps {
  onClose: () => void;
}

export function Shop({ onClose }: ShopProps) {
  const difficulty = useGameStore((s) => s.difficulty);
  const config = useGameStore((s) => s.config);
  const profile = useProfileStore((s) => s.profile);
  const purchaseItem = useProfileStore((s) => s.purchaseItem);
  const dispatch = useGameStore((s) => s.dispatch);

  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  const handlePurchase = (item: ShopItem) => {
    const price = getItemPrice(item, difficulty);
    const category = item.category === "help" ? "helpItems" : "themes";

    const success = purchaseItem(item.id, price, category);

    if (success) {
      dispatch({
        type: "SET_TOAST",
        message: `Purchased ${item.name}!`,
        toastType: "success",
      });
      setSelectedItem(null);
    } else {
      dispatch({
        type: "SET_TOAST",
        message: "Insufficient coins",
        toastType: "error",
      });
    }
  };

  const helpItems = SHOP_CATALOG.filter((item) => item.category === "help");
  const themeItems = SHOP_CATALOG.filter((item) => item.category === "theme");

  const allInventory = [
    ...profile.inventory.helpItems,
    ...profile.inventory.themes,
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Shop</h2>
              <p className="text-blue-100 mt-1">
                Purchase items with your coins
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Help Items Section */}
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🛠️</span>
              <span>Help Items</span>
            </h3>
            {!config.helpEnabled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Help items are currently disabled in settings. Enable them
                  to use purchased items.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {helpItems.map((item) => {
                const price = getItemPrice(item, difficulty);
                const owned = allInventory.includes(item.id);
                const purchaseCheck = canPurchase(
                  item,
                  profile.coins,
                  difficulty,
                  allInventory,
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
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      {item.tier === "premium" && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <span>🪙</span>
                        <span>{price}</span>
                        {difficulty === "expert" && (
                          <span className="text-xs text-red-600">(2x)</span>
                        )}
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

          {/* Theme Items Section */}
          <section>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🎨</span>
              <span>Themes</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themeItems.map((item) => {
                const price = getItemPrice(item, difficulty);
                const owned = allInventory.includes(item.id);
                const purchaseCheck = canPurchase(
                  item,
                  profile.coins,
                  difficulty,
                  allInventory,
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
