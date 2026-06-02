import type { CustomizationOption, EquippedItem } from "@/lib/account-api";
import { DEFAULT_SKIN_SRC, isPipoSkinSrc } from "@/lib/cat-sprites";

export type AvatarConfig = {
  skinSrc: string;
};

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinSrc: DEFAULT_SKIN_SRC,
};

export function getOptionValue(option: CustomizationOption): string {
  return option.imageUrl;
}

export function isSkinOption(option: CustomizationOption): boolean {
  return option.type === "FUR" && isPipoSkinSrc(option.imageUrl);
}

export function equippedToConfig(equipped: EquippedItem[]): AvatarConfig {
  const skin = equipped.find((row) => row.type === "FUR" && isPipoSkinSrc(row.customization.imageUrl));
  if (skin) {
    return { skinSrc: skin.customization.imageUrl };
  }
  return { ...DEFAULT_AVATAR_CONFIG };
}

export function previewConfigForOption(
  current: AvatarConfig,
  option: CustomizationOption
): AvatarConfig {
  if (isSkinOption(option)) {
    return { skinSrc: getOptionValue(option) };
  }
  return current;
}
