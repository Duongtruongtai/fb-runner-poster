// Golden hours for Vietnamese crypto audience (Vietnam time, UTC+7)
export const GOLDEN_HOURS = [
  { hour: 7, minute: 0 }, // morning market check over coffee
  { hour: 12, minute: 0 }, // lunch break scrolling
  { hour: 21, minute: 0 }, // evening prime time, most active hours
];

export const VN_UTC_OFFSET_HOURS = 7;
export const MIN_LEAD_MINUTES = 15; // Facebook requires scheduled time >= 10 min in the future

// Returns up to `totalNeeded` upcoming golden-hour slots (unix millis, chronological),
// taking at most `perDay` slots per day.
export function upcomingSlots(totalNeeded, perDay = 1, maxDays = 75) {
  const slots = [];
  const now = Date.now();
  const minTime = now + MIN_LEAD_MINUTES * 60 * 1000;
  const ref = new Date(now);

  for (let dayOffset = 0; slots.length < totalNeeded && dayOffset < maxDays; dayOffset++) {
    const daySlots = [];
    for (const { hour, minute } of GOLDEN_HOURS) {
      const utcMillis = Date.UTC(
        ref.getUTCFullYear(),
        ref.getUTCMonth(),
        ref.getUTCDate() + dayOffset,
        hour - VN_UTC_OFFSET_HOURS,
        minute
      );
      if (utcMillis >= minTime) daySlots.push(utcMillis);
    }
    slots.push(...daySlots.slice(0, perDay));
  }
  return slots.slice(0, totalNeeded);
}

export function formatVN(millis) {
  return new Date(millis + VN_UTC_OFFSET_HOURS * 3600 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 16);
}
