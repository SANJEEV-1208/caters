import {
  getISTDate,
  getTodayIST,
  getTomorrowIST,
  getDateAfterDaysIST,
  formatDateTimeIST,
  formatDateIST,
  formatTimeIST,
  getCurrentTimestampIST,
  isToday,
  isTomorrow,
  getRelativeTimeIST,
} from '@/src/utils/dateUtils';

describe('dateUtils', () => {
  describe('IST Date Functions', () => {
    test('should return Date object with IST offset', () => {
      const istDate = getISTDate();

      expect(istDate).toBeInstanceOf(Date);
      expect(istDate.getTime()).toBeGreaterThan(0);
    });

    test('should return today in YYYY-MM-DD format', () => {
      const today = getTodayIST();

      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof today).toBe('string');
    });

    test('should return tomorrow in YYYY-MM-DD format', () => {
      const tomorrow = getTomorrowIST();

      expect(tomorrow).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify tomorrow is after today
      const today = getTodayIST();
      expect(new Date(tomorrow).getTime()).toBeGreaterThan(new Date(today).getTime());
    });

    test('should return date after N days in YYYY-MM-DD format', () => {
      const today = getTodayIST();
      const after7Days = getDateAfterDaysIST(7);

      expect(after7Days).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const todayMs = new Date(today).getTime();
      const after7DaysMs = new Date(after7Days).getTime();
      const diffDays = Math.floor((after7DaysMs - todayMs) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(7);
    });

    test('should handle negative days (past dates)', () => {
      const today = getTodayIST();
      const before3Days = getDateAfterDaysIST(-3);

      expect(before3Days).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const todayMs = new Date(today).getTime();
      const before3DaysMs = new Date(before3Days).getTime();

      expect(before3DaysMs).toBeLessThan(todayMs);
    });

    test('should return current timestamp in ISO format', () => {
      const timestamp = getCurrentTimestampIST();

      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('Date Formatting', () => {
    test('should format date with time in IST', () => {
      const date = '2026-01-30T14:30:00.000Z';
      const formatted = formatDateTimeIST(date);

      expect(formatted).toContain('IST');
      expect(typeof formatted).toBe('string');
    });

    test('should format Date object with time', () => {
      const date = new Date('2026-01-30T14:30:00.000Z');
      const formatted = formatDateTimeIST(date);

      expect(formatted).toContain('IST');
      expect(typeof formatted).toBe('string');
    });

    test('should format date without time', () => {
      const date = '2026-01-30T14:30:00.000Z';
      const formatted = formatDateIST(date);

      expect(formatted).not.toContain('IST');
      expect(formatted).not.toContain(':');
      expect(typeof formatted).toBe('string');
    });

    test('should format time only', () => {
      const date = '2026-01-30T14:30:00.000Z';
      const formatted = formatTimeIST(date);

      expect(formatted).toMatch(/\d{1,2}:\d{2}\s(?:AM|PM)/i);
      expect(typeof formatted).toBe('string');
    });

    test('should handle different date string formats', () => {
      const isoDate = '2026-01-30T14:30:00.000Z';
      const simpleDate = '2026-01-30';

      expect(() => formatDateIST(isoDate)).not.toThrow();
      expect(() => formatDateIST(simpleDate)).not.toThrow();
    });
  });

  describe('Date Comparison', () => {
    test('should correctly identify today', () => {
      const today = getTodayIST();

      expect(isToday(today)).toBe(true);
      expect(isToday(`${today}T10:00:00.000Z`)).toBe(true);
    });

    test('should correctly identify non-today dates', () => {
      const tomorrow = getTomorrowIST();
      const yesterday = getDateAfterDaysIST(-1);

      expect(isToday(tomorrow)).toBe(false);
      expect(isToday(yesterday)).toBe(false);
    });

    test('should correctly identify tomorrow', () => {
      const tomorrow = getTomorrowIST();

      expect(isTomorrow(tomorrow)).toBe(true);
      expect(isTomorrow(`${tomorrow}T10:00:00.000Z`)).toBe(true);
    });

    test('should correctly identify non-tomorrow dates', () => {
      const today = getTodayIST();
      const dayAfterTomorrow = getDateAfterDaysIST(2);

      expect(isTomorrow(today)).toBe(false);
      expect(isTomorrow(dayAfterTomorrow)).toBe(false);
    });
  });

  describe('Relative Time', () => {
    test('should return "just now" for very recent times', () => {
      const now = getISTDate();
      const relativeTime = getRelativeTimeIST(now);

      expect(relativeTime).toBe('just now');
    });

    test('should return minutes ago for recent times', () => {
      const istDate = getISTDate();
      const pastDate = new Date(istDate.getTime() - 5 * 60 * 1000); // 5 minutes ago
      const relativeTime = getRelativeTimeIST(pastDate);

      expect(relativeTime).toMatch(/\d+ mins? ago/);
    });

    test('should return hours ago for times within 24 hours', () => {
      const istDate = getISTDate();
      const pastDate = new Date(istDate.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      const relativeTime = getRelativeTimeIST(pastDate);

      expect(relativeTime).toMatch(/\d+ hours? ago/);
    });

    test('should return days ago for times within a week', () => {
      const istDate = getISTDate();
      const pastDate = new Date(istDate.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const relativeTime = getRelativeTimeIST(pastDate);

      expect(relativeTime).toMatch(/\d+ days? ago/);
    });

    test('should return formatted date for times over a week', () => {
      const istDate = getISTDate();
      const pastDate = new Date(istDate.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const relativeTime = getRelativeTimeIST(pastDate);

      // Should not contain "ago", should be a formatted date
      expect(relativeTime).not.toContain('ago');
    });

    test('should handle Date objects', () => {
      const istDate = getISTDate();
      const pastDate = new Date(istDate.getTime() - 30 * 60 * 1000); // 30 minutes ago
      const relativeTime = getRelativeTimeIST(pastDate);

      expect(relativeTime).toMatch(/\d+ mins ago/);
    });

    test('should handle date strings', () => {
      const istDate = getISTDate();
      const pastDate = new Date(istDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const relativeTime = getRelativeTimeIST(pastDate.toISOString());

      expect(relativeTime).toMatch(/\d+ hours? ago/);
    });

    test('should handle singular time units correctly', () => {
      const istDate = getISTDate();

      // 1 minute ago
      const oneMinAgo = new Date(istDate.getTime() - 60 * 1000);
      expect(getRelativeTimeIST(oneMinAgo)).toBe('1 min ago');

      // 1 hour ago
      const oneHourAgo = new Date(istDate.getTime() - 60 * 60 * 1000);
      expect(getRelativeTimeIST(oneHourAgo)).toBe('1 hour ago');

      // 1 day ago
      const oneDayAgo = new Date(istDate.getTime() - 24 * 60 * 60 * 1000);
      expect(getRelativeTimeIST(oneDayAgo)).toBe('1 day ago');
    });
  });

  describe('Date Consistency', () => {
    test('should maintain consistency across date functions', () => {
      const today = getTodayIST();
      const tomorrow = getTomorrowIST();
      const after1Day = getDateAfterDaysIST(1);

      expect(tomorrow).toBe(after1Day);
    });

    test('should handle edge cases at midnight', () => {
      const today = getTodayIST();
      const tomorrow = getTomorrowIST();

      expect(today).not.toBe(tomorrow);
      expect(new Date(tomorrow).getTime()).toBeGreaterThan(new Date(today).getTime());
    });
  });
});
