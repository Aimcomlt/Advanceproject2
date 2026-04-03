import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}

export function formatAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
