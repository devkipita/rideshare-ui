import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++)
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

export function avatarColors(name: string) {
  const h = hashString(name) % 360;
  return {
    bg: `hsl(${h} 70% 55% / 0.18)`,
    border: `hsl(${h} 70% 55% / 0.45)`,
    text: `hsl(${h} 55% 28% / 0.95)`,
  };
}
