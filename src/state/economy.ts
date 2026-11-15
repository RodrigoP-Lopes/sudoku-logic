export const DAILY_HINTS = 3;
export const DAILY_CHECKS = 2;
export const MAX_HINTS = 99;
export const MAX_CHECKS = 99;

export type Currency = 'hints' | 'checks';

export interface Economy {
  hints: number;
  checks: number;
  /** Local calendar day (YYYY-MM-DD) the daily grant was last applied. */
  lastDailyDate: string;
}

export function dateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEconomy(date: Date = new Date()): Economy {
  return { hints: DAILY_HINTS, checks: DAILY_CHECKS, lastDailyDate: dateKey(date) };
}

export function applyDailyGrant(economy: Economy, date: Date = new Date()): Economy {
  const today = dateKey(date);
  if (economy.lastDailyDate === today) return economy;
  return {
    hints: Math.min(economy.hints + DAILY_HINTS, MAX_HINTS),
    checks: Math.min(economy.checks + DAILY_CHECKS, MAX_CHECKS),
    lastDailyDate: today,
  };
}

export function spend(economy: Economy, currency: Currency): Economy | null {
  if (economy[currency] <= 0) return null;
  return { ...economy, [currency]: economy[currency] - 1 };
}

export function grant(economy: Economy, currency: Currency): Economy {
  const cap = currency === 'hints' ? MAX_HINTS : MAX_CHECKS;
  return { ...economy, [currency]: Math.min(economy[currency] + 1, cap) };
}
