"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  frameToBackgroundPosition,
  SPRITE_DEFAULT_FRAME,
  SPRITE_FRAME_COUNT,
  spriteDisplaySize,
} from "@/lib/cat-sprites";
import { cn } from "@/lib/utils";

const FRAME_MS = 90;

export interface CatSpriteProps {
  src: string;
  /** Висота відображення в px */
  size?: number;
  /** Кадр за замовчуванням (0 = кадр №1) */
  defaultFrame?: number;
  /** Циклічна анімація без наведення */
  animateAlways?: boolean;
  /** Анімація при наведенні (якщо animateAlways = false) */
  animateOnHover?: boolean;
  className?: string;
}

export function CatSprite({
  src,
  size = 128,
  defaultFrame = SPRITE_DEFAULT_FRAME,
  animateAlways = false,
  animateOnHover = true,
  className,
}: CatSpriteProps) {
  const [frame, setFrame] = useState(defaultFrame);
  const [hovering, setHovering] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAnim = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const shouldAnimate = animateAlways || (animateOnHover && hovering);

  useEffect(() => {
    if (!shouldAnimate) {
      clearAnim();
      setFrame(defaultFrame);
      return;
    }

    let f = defaultFrame;
    setFrame(f);
    intervalRef.current = setInterval(() => {
      f = (f + 1) % SPRITE_FRAME_COUNT;
      setFrame(f);
    }, FRAME_MS);

    return clearAnim;
  }, [shouldAnimate, defaultFrame, clearAnim]);

  const { width, height, sheetWidth, sheetHeight, scale } = spriteDisplaySize(size);
  const { backgroundPosition } = frameToBackgroundPosition(frame, scale);

  return (
    <div
      className={cn("shrink-0 overflow-hidden", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      role="img"
      style={{ width, height }}
    >
      <div
        aria-hidden
        className="[image-rendering:pixelated]"
        style={{
          width,
          height,
          backgroundImage: `url(${src})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
          backgroundPosition,
        }}
      />
    </div>
  );
}
