/** Pipo nekonin sprite sheets: 96×128 per frame, 3×4 grid (12 frames). */

export const SPRITE_FRAME_W = 96;
export const SPRITE_FRAME_H = 128;
export const SPRITE_COLS = 3;
export const SPRITE_ROWS = 4;
export const SPRITE_FRAME_COUNT = 12;
/** Кадр №1 (нумерація з 1) = індекс 0 — верхній лівий. */
export const SPRITE_DEFAULT_FRAME = 0;

export const DEFAULT_SKIN_SRC = "/cats/pipo-nekonin001.png";

export const PIPO_SKIN_FILES = Array.from({ length: 32 }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return `pipo-nekonin${n}.png`;
});

export const PIPO_SKIN_SRCS = PIPO_SKIN_FILES.map((file) => `/cats/${file}`);

export function isPipoSkinSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.includes("pipo-nekonin");
}

export function frameToBackgroundPosition(frame: number, scale: number) {
  const col = frame % SPRITE_COLS;
  const row = Math.floor(frame / SPRITE_COLS);
  return {
    backgroundPosition: `-${col * SPRITE_FRAME_W * scale}px -${row * SPRITE_FRAME_H * scale}px`,
  };
}

export function spriteDisplaySize(height: number) {
  const scale = height / SPRITE_FRAME_H;
  return {
    scale,
    width: SPRITE_FRAME_W * scale,
    height: SPRITE_FRAME_H * scale,
    sheetWidth: SPRITE_COLS * SPRITE_FRAME_W * scale,
    sheetHeight: SPRITE_ROWS * SPRITE_FRAME_H * scale,
  };
}
