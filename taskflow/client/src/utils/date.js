/**
 * Date helpers. Due dates travel as plain "YYYY-MM-DD" strings, so they never
 * shift by a day when the user's timezone differs from the server's.
 */
const pad = (n) => String(n).padStart(2, '0');

/** Today's date in the USER'S local timezone, as YYYY-MM-DD */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const toUtcMs = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Whole days from `from` to `to` (positive when `to` is later) */
export const daysBetween = (from, to) => Math.round((toUtcMs(to) - toUtcMs(from)) / 86400000);

export function formatDate(str) {
  if (!str) return '';
  return new Date(`${str}T00:00:00Z`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatToday() {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * Derived UI value: turns a task's due date + status into a label and a tone.
 * tone: 'overdue' | 'today' | 'soon' | 'later' | 'done' | 'none'
 */
export function describeDue(task, today = todayStr()) {
  if (!task.dueDate) return { label: 'No due date', tone: 'none' };
  if (task.status === 'Done') return { label: `Due ${formatDate(task.dueDate)}`, tone: 'done' };

  const diff = daysBetween(today, task.dueDate);
  if (diff < -1) return { label: `Overdue by ${Math.abs(diff)} days`, tone: 'overdue' };
  if (diff === -1) return { label: 'Overdue by 1 day', tone: 'overdue' };
  if (diff === 0) return { label: 'Due today', tone: 'today' };
  if (diff === 1) return { label: 'Due tomorrow', tone: 'soon' };
  if (diff <= 7) return { label: `Due in ${diff} days`, tone: 'soon' };
  return { label: `Due ${formatDate(task.dueDate)}`, tone: 'later' };
}
