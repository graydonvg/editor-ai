import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateLayer() {
  return {
    id: crypto.randomUUID(),
    url: "",
    height: 0,
    width: 0,
    publicId: "",
  };
}
