import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a date to UTC midnight, removing any timezone offset.
 * This ensures that a date selected in the UI (e.g., "November 15th")
 * is sent to the API as "2025-11-15T00:00:00.000Z" regardless of the user's timezone.
 *
 * @param date - The date to normalize
 * @returns A new Date object set to midnight UTC
 */
export function toUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  ))
}
