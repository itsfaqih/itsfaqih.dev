import { cx, type ClassValue } from "./stylex";

export function cn(...inputs: ClassValue[]) {
  return cx(...inputs);
}
