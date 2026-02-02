/**
 * Date utility functions for IST timezone handling
 */

/**
 * Get current date/time in IST (Indian Standard Time)
 * IST = UTC + 5:30
 */
export function getISTDate(): Date {
  const now = new Date();
  // Convert to IST by adding 5 hours and 30 minutes (in milliseconds)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const utcTime = now.getTime();
  const istTime = utcTime + istOffset;
  return new Date(istTime);
}

/**
 * Get current date in YYYY-MM-DD format (IST)
 */
export function getTodayIST(): string {
  const istDate = getISTDate();
  return istDate.toISOString().split('T')[0];
}

/**
 * Get tomorrow's date in YYYY-MM-DD format (IST)
 */
export function getTomorrowIST(): string {
  const istDate = getISTDate();
  istDate.setDate(istDate.getDate() + 1);
  return istDate.toISOString().split('T')[0];
}

/**
 * Get date after N days in YYYY-MM-DD format (IST)
 */
export function getDateAfterDaysIST(days: number): string {
  const istDate = getISTDate();
  istDate.setDate(istDate.getDate() + days);
  return istDate.toISOString().split('T')[0];
}

/**
 * Format date to human-readable IST format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Jan 30, 2026 at 2:30 PM IST")
 */
export function formatDateTimeIST(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Note: Input dates are already in IST, no offset conversion needed
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return dateObj.toLocaleString('en-IN', options) + ' IST';
}

/**
 * Format date to simple format (e.g., "Jan 30, 2026")
 */
export function formatDateIST(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Note: Input dates are already in IST, no offset conversion needed
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return dateObj.toLocaleString('en-IN', options);
}

/**
 * Format time only (e.g., "2:30 PM")
 */
export function formatTimeIST(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Note: Input dates are already in IST, no offset conversion needed
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return dateObj.toLocaleString('en-IN', options);
}

/**
 * Get current timestamp in IST
 */
export function getCurrentTimestampIST(): string {
  return getISTDate().toISOString();
}

/**
 * Check if a date string is today (IST)
 */
export function isToday(dateString: string): boolean {
  const today = getTodayIST();
  const date = dateString.split('T')[0];
  return date === today;
}

/**
 * Check if a date string is tomorrow (IST)
 */
export function isTomorrow(dateString: string): boolean {
  const tomorrow = getTomorrowIST();
  const date = dateString.split('T')[0];
  return date === tomorrow;
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTimeIST(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = getISTDate();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDateIST(date);
}
