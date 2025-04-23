// timezone.ts - Utility functions for handling timezones consistently

/**
 * Gets the current date in the user's local timezone
 */
export function getUserLocalDate(): Date {
  return new Date();
}

/**
 * Gets the current date in UTC
 */
export function getUTCDate(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
    ),
  );
}

/**
 * Converts a date to an ISO date string (YYYY-MM-DD) in user's local timezone
 */
export function toLocalDateString(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA"); // en-CA returns YYYY-MM-DD format
}

/**
 * Converts a date to an ISO date string (YYYY-MM-DD) in UTC
 */
export function toUTCDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Gets "today" as a string in user's local timezone
 */
export function getTodayString(): string {
  return toLocalDateString(getUserLocalDate());
}

/**
 * Gets "yesterday" as a string in user's local timezone
 */
export function getYesterdayString(): string {
  const yesterday = getUserLocalDate();
  yesterday.setDate(yesterday.getDate() - 1);
  return toLocalDateString(yesterday);
}

/**
 * Gets "tomorrow" as a string in user's local timezone
 */
export function getTomorrowString(): string {
  const tomorrow = getUserLocalDate();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateString(tomorrow);
}

/**
 * Formats a date for display with the user's timezone
 */
export function formatDisplayDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  };

  return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
}

/**
 * Creates a readable time string in the user's timezone
 */
export function formatDisplayTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Converts a UTC date string to a local date object
 * This is useful when receiving dates from the server that are in UTC
 */
export function utcStringToLocalDate(utcDateString: string): Date {
  const date = new Date(utcDateString);
  return date;
}

/**
 * Creates a Date object from a YYYY-MM-DD string in the user's timezone
 */
export function dateStringToLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JS Date
}

/**
 * Compare if two dates are the same day in the user's local timezone
 */
export function isSameLocalDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today in the user's local timezone
 */
export function isToday(date: Date): boolean {
  return isSameLocalDay(date, new Date());
}

/**
 * Extracts timezone info from the user's browser
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Gets timezone abbreviation (like EST, PDT) based on the user's locale
 */
export function getTimezoneAbbreviation(): string {
  const dateString = new Date().toLocaleTimeString("en-US", {
    timeZoneName: "short",
  });
  const match = dateString.match(/[A-Z]{3,4}$/);
  return match ? match[0] : "";
}

/**
 * Generate a range of dates for UI date pickers
 */
export function getDateRange(
  daysBack: number = 14,
  daysForward: number = 14,
): Array<{ value: string; label: string; isToday: boolean }> {
  const dates = [];
  const today = new Date();

  for (let i = -daysBack; i <= daysForward; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateString = toLocalDateString(date);
    const isToday = i === 0;

    dates.push({
      value: dateString,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      isToday,
    });
  }

  return dates;
}
