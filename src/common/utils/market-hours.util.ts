/**
 * Market Hours Utility
 * 
 * Provides functions to check if Turkish stock market (BIST) is open.
 * BIST100 trading hours: Monday-Friday, 09:00-18:00 (Turkey time, UTC+3)
 */

export class MarketHoursUtil {
  /**
   * Check if BIST market is currently open
   * @returns true if market is open (Monday-Friday, 09:00-18:00 TRT)
   */
  static isMarketOpen(): boolean {
    const now = new Date();
    return this.isMarketOpenAt(now);
  }

  /**
   * Check if BIST market is open at a specific date/time
   * @param date Date to check
   * @returns true if market is open at the given date/time
   */
  static isMarketOpenAt(date: Date): boolean {
    // Convert to Turkey time (UTC+3)
    const turkeyTime = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    const day = turkeyTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = turkeyTime.getHours();

    // Market is closed on weekends
    if (day === 0 || day === 6) {
      return false;
    }

    // Market hours: 09:00 - 18:00 (inclusive)
    return hour >= 9 && hour < 18;
  }

  /**
   * Check if given date is a weekday (Monday-Friday)
   * @param date Date to check
   * @returns true if weekday
   */
  static isWeekday(date: Date = new Date()): boolean {
    const turkeyTime = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    const day = turkeyTime.getDay();
    return day >= 1 && day <= 5; // Monday-Friday
  }

  /**
   * Get next market open time
   * @param fromDate Starting date (default: now)
   * @returns Date when market next opens
   */
  static getNextMarketOpen(fromDate: Date = new Date()): Date {
    const turkeyTime = new Date(fromDate.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    const nextOpen = new Date(turkeyTime);
    
    // Set to next 09:00
    nextOpen.setHours(9, 0, 0, 0);

    // If current time is before 09:00 today, market opens today
    if (turkeyTime.getHours() < 9) {
      const day = turkeyTime.getDay();
      if (day >= 1 && day <= 5) {
        return this.convertToUTCTime(nextOpen);
      }
    }

    // Otherwise, find next weekday
    let day = turkeyTime.getDay();
    if (day === 0) {
      // Sunday -> next Monday
      nextOpen.setDate(nextOpen.getDate() + 1);
    } else if (day === 6) {
      // Saturday -> next Monday
      nextOpen.setDate(nextOpen.getDate() + 2);
    } else if (day === 5 && turkeyTime.getHours() >= 18) {
      // Friday after 18:00 -> next Monday
      nextOpen.setDate(nextOpen.getDate() + 3);
    } else {
      // Other days -> next day
      nextOpen.setDate(nextOpen.getDate() + 1);
      const nextDay = nextOpen.getDay();
      if (nextDay === 0) {
        // If next day is Sunday, skip to Monday
        nextOpen.setDate(nextOpen.getDate() + 1);
      } else if (nextDay === 6) {
        // If next day is Saturday, skip to Monday
        nextOpen.setDate(nextOpen.getDate() + 2);
      }
    }

    return this.convertToUTCTime(nextOpen);
  }

  /**
   * Get next market close time
   * @param fromDate Starting date (default: now)
   * @returns Date when market next closes
   */
  static getNextMarketClose(fromDate: Date = new Date()): Date {
    const turkeyTime = new Date(fromDate.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    const nextClose = new Date(turkeyTime);
    
    // Set to 18:00
    nextClose.setHours(18, 0, 0, 0);

    // If current time is before 18:00 today and it's a weekday, market closes today
    if (turkeyTime.getHours() < 18) {
      const day = turkeyTime.getDay();
      if (day >= 1 && day <= 5) {
        return this.convertToUTCTime(nextClose);
      }
    }

    // Otherwise, find next weekday 18:00
    let day = turkeyTime.getDay();
    if (day === 0) {
      // Sunday -> Monday 18:00
      nextClose.setDate(nextClose.getDate() + 1);
    } else if (day === 6) {
      // Saturday -> Monday 18:00
      nextClose.setDate(nextClose.getDate() + 2);
    } else {
      // Other days -> next weekday 18:00
      nextClose.setDate(nextClose.getDate() + 1);
      const nextDay = nextClose.getDay();
      if (nextDay === 0) {
        nextClose.setDate(nextClose.getDate() + 1);
      } else if (nextDay === 6) {
        nextClose.setDate(nextClose.getDate() + 2);
      }
    }

    return this.convertToUTCTime(nextClose);
  }

  /**
   * Convert Turkey time to UTC for accurate scheduling
   */
  private static convertToUTCTime(turkeyTime: Date): Date {
    // Turkey is UTC+3, so subtract 3 hours
    const utcTime = new Date(turkeyTime);
    utcTime.setHours(utcTime.getHours() - 3);
    return utcTime;
  }
}

