import type { UniqueIdentifier } from "@dnd-kit/core";
import type {
  TechDragSource,
  TechSlotZone,
  TechStackItem,
} from "../-types/home-types";

const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-=";

export function getTechIconSrc(item: TechStackItem): string {
  return `https://cdn.simpleicons.org/${item.icon}/${item.color.replace("#", "")}`;
}

export function createTechSlotId(zone: TechSlotZone, index: number): string {
  return `${zone}:${index}`;
}

export function parseTechSlotId(id: UniqueIdentifier): TechDragSource | null {
  const [zone, rawIndex] = String(id).split(":");
  if ((zone !== "inventory" && zone !== "hotbar") || rawIndex === undefined) {
    return null;
  }

  const index = Number(rawIndex);
  if (!Number.isInteger(index)) {
    return null;
  }

  return { zone, index };
}

export function isSameTechDragSource(
  left: TechDragSource | null,
  right: TechDragSource | null,
): boolean {
  if (left === right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  return left.zone === right.zone && left.index === right.index;
}

export function getDistanceFromPointToRect(
  x: number,
  y: number,
  rect: { top: number; right: number; bottom: number; left: number },
): number {
  const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
  const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
  return Math.hypot(dx, dy);
}

export function scrambleText(target: string, revealCount: number): string {
  return target
    .split("")
    .map((char, index) => {
      if (char === " ") {
        return char;
      }
      if (index < revealCount) {
        return char;
      }
      return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    })
    .join("");
}

export function scrambleByProgress(target: string, progress: number): string {
  if (progress >= 1) {
    return target;
  }

  const revealCount = Math.floor(target.length * progress);
  return scrambleText(target, revealCount);
}
