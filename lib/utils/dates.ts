import { format } from "date-fns";

const today = new Date();
export const todayAsString = today.toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Get the start of day in UTC (00:00:00.000)
 */
export function startOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

/**
 * Get the end of day in UTC (23:59:59.999)
 */
export function endOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

export function formatDateString(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getDateTitle(date: Date): string {
  const today = startOfDayUTC(new Date());
  const targetDate = startOfDayUTC(date);

  const daysDiff = Math.floor(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysDiff === 0) return "Todays Tasks";
  if (daysDiff === 1) return "Tomorrows Tasks";
  if (daysDiff === -1) return "Yesterdays Tasks";

  return `Tasks for ${format(date, "EEEE")}`;
}
