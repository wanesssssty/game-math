"use client";

import { apiRequest } from "@/lib/api/client";

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export type CustomizationType = "FUR" | "EYES" | "ACCESSORY" | "BACKGROUND";
export type ApiOperationType = "ADD" | "SUB" | "MUL" | "DIV";

export type CustomizationOption = {
  id: string;
  name: string;
  type: CustomizationType;
  imageUrl: string;
  price: number;
  rarity: Rarity;
};

export type InventoryItem = {
  id: string;
  customizationId: string;
  option: CustomizationOption;
};

export type ErrorLogEntry = {
  id: string;
  operationType: ApiOperationType;
  number1: number;
  number2: number;
  correctAnswer: number;
  userAnswer: number;
  attempts: number;
  createdAt: string;
};

export type ProgressEntry = {
  id: string;
  operationType: ApiOperationType;
  level: number;
  highScore: number;
  bestStreak: number;
};

export type CatSummary = {
  id: string;
  name: string;
  rarity: Rarity;
  imageUrl: string;
};

export type EquippedItem = {
  id: string;
  type: CustomizationType;
  customizationId: string;
  customization: CustomizationOption;
};

export type AccountData = {
  user: {
    id: string;
    email: string;
    name: string | null;
    candyBalance: number;
  };
  selectedCat: CatSummary | null;
  unlockedCats: CatSummary[];
  inventory: InventoryItem[];
  equipped: EquippedItem[];
  progress: ProgressEntry[];
  recentErrors: ErrorLogEntry[];
};

export type ShopCatalog = {
  items: CustomizationOption[];
};

export type ShopPurchaseResult = {
  message: string;
  customizationId: string;
  candyBalance: number;
};

export type InventoryResponse = {
  items: InventoryItem[];
};

export async function fetchAccount() {
  return apiRequest<AccountData>("/api/account");
}

export async function fetchShopCatalog() {
  return apiRequest<ShopCatalog>("/api/shop");
}

export async function buyShopItem(customizationId: string) {
  return apiRequest<ShopPurchaseResult>("/api/shop/buy", {
    method: "POST",
    body: JSON.stringify({ customizationId }),
  });
}

export async function fetchInventory() {
  return apiRequest<InventoryResponse>("/api/inventory");
}

export async function fetchErrorLog(limit = 8) {
  return apiRequest<{ errors: ErrorLogEntry[] }>(`/api/errors?limit=${limit}`);
}
