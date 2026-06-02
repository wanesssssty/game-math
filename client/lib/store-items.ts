import type { CustomizationOption, CustomizationType, Rarity } from "@/lib/account-api";

const typeMeta: Record<
  CustomizationType,
  { emoji: string; label: string; description: string }
> = {
  FUR: {
    emoji: "🐱",
    label: "Скін",
    description: "Повний вигляд котика з анімацією при наведенні.",
  },
  EYES: {
    emoji: "✨",
    label: "Очі",
    description: "Додає виразності погляду аватара.",
  },
  ACCESSORY: {
    emoji: "🎀",
    label: "Аксесуар",
    description: "Прикраса для образу маленького математика.",
  },
  BACKGROUND: {
    emoji: "🌌",
    label: "Фон",
    description: "Нове тло для профілю та аватара.",
  },
};

const rarityMeta: Record<Rarity, { label: string; className: string }> = {
  COMMON: {
    label: "Звичайний",
    className: "border-slate-600/70 bg-slate-800/80 text-slate-200",
  },
  RARE: {
    label: "Рідкісний",
    className: "border-sky-400/40 bg-sky-500/10 text-sky-200",
  },
  EPIC: {
    label: "Епічний",
    className: "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200",
  },
  LEGENDARY: {
    label: "Легендарний",
    className: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  },
};

export function getCustomizationUi(option: CustomizationOption) {
  return typeMeta[option.type];
}

export function getRarityUi(rarity: Rarity) {
  return rarityMeta[rarity];
}
