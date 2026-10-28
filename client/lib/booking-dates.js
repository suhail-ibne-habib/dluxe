/** Local calendar date as YYYY-MM-DD (not UTC). */
export function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isPastDate(value) {
  if (!value) return false;
  return value < todayISO();
}

export function isSameDay(value) {
  if (!value) return false;
  return value === todayISO();
}

/** Tomorrow as YYYY-MM-DD — earliest date allowed for online booking. */
export function earliestBookableISO() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
