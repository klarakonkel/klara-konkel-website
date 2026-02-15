import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPublicUrl(path: string): string {
  const base = (import.meta.env.BASE_URL ?? "").replace(/\/$/, "")
  const p = path.startsWith("/") ? path : "/" + path
  return base ? base + p : p
}
