import { twMerge } from "tailwind-merge";

interface ClassValue {
  [key: string]: boolean | undefined | null;
}

export default function cn(
  ...classes: (string | ClassValue | undefined | null)[]
): string {
  const classList: string[] = [];
  for (const item of classes) {
    if (typeof item === "string" && item) {
      classList.push(item);
    } else if (item && typeof item === "object") {
      for (const key in item) {
        if (item[key]) {
          classList.push(key);
        }
      }
    }
  }
  return twMerge(...classList);
}
