/**
 * Preferred service time helpers (12h UI ↔ 24h HH:mm API).
 */

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export const PREFERRED_HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
export const PREFERRED_MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

export function toHHmm24({ hour12, minute, meridiem }) {
  let hours = Number(hour12);
  const mins = Number(minute) || 0;
  const period = String(meridiem || "AM").toUpperCase();
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${pad2(hours)}:${pad2(mins)}`;
}

export function formatPreferredTime12({ hour12, minute, meridiem }) {
  return `${pad2(hour12)}:${pad2(minute)} ${String(meridiem || "AM").toUpperCase()}`;
}

export function defaultPreferredTime() {
  return { hour12: 10, minute: 0, meridiem: "AM" };
}
