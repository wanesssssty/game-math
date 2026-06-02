import { CatSprite } from "@/components/CatSprite";
import { DEFAULT_SKIN_SRC, isPipoSkinSrc } from "@/lib/cat-sprites";

export interface CatAvatarProps {
  skinSrc?: string | null;
  size?: number;
  animateAlways?: boolean;
  animateOnHover?: boolean;
}

/** Відображення кота: PNG spritesheet (pipo-nekonin) або fallback, якщо шлях не задано. */
export function CatAvatar({
  skinSrc = DEFAULT_SKIN_SRC,
  size = 200,
  animateAlways = false,
  animateOnHover = true,
}: CatAvatarProps) {
  const src = skinSrc && isPipoSkinSrc(skinSrc) ? skinSrc : DEFAULT_SKIN_SRC;

  return (
    <div className="inline-flex items-center justify-center rounded-2xl bg-slate-900/80 p-2">
      <CatSprite
        animateAlways={animateAlways}
        animateOnHover={animateOnHover}
        size={size}
        src={src}
      />
    </div>
  );
}
