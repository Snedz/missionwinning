/** Consecutive-day fuel logging streak (localStorage). */

export function getFuelLogStreak(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem('mw_fuel_streak') || '0', 10) || 0;
}

export function bumpFuelLogStreak(): number {
  if (typeof window === 'undefined') return 0;
  const today = new Date().toISOString().split('T')[0];
  const last = localStorage.getItem('mw_fuel_last_log_date');
  let count = getFuelLogStreak();

  if (last === today) return count;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (last === yesterdayStr) count += 1;
  else count = 1;

  localStorage.setItem('mw_fuel_streak', String(count));
  localStorage.setItem('mw_fuel_last_log_date', today);
  return count;
}
