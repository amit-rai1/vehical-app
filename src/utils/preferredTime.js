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

/** Parse API "HH:mm" / "H:mm" into 12h parts. */
export function fromHHmm24(value) {
  if (!value) return defaultPreferredTime();
  const raw = String(value).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return defaultPreferredTime();
  let hours = Number(match[1]);
  const minute = Number(match[2]) || 0;
  if (Number.isNaN(hours) || hours < 0 || hours > 23) return defaultPreferredTime();
  const meridiem = hours >= 12 ? "PM" : "AM";
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12;
  const snapped = Math.round(minute / 5) * 5;
  return {
    hour12,
    minute: snapped >= 60 ? 55 : snapped,
    meridiem
  };
}

export function formatApiTimeDisplay(value) {
  if (!value) return "—";
  const parts = fromHHmm24(value);
  return formatPreferredTime12(parts);
}
