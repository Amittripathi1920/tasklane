import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNowStrict, isAfter, isBefore, parseISO, startOfDay } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(value, fallback = "No date") {
  if (!value) return fallback;
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

export function formatDateTime(value, fallback = "Unknown time") {
  if (!value) return fallback;
  try {
    return format(parseISO(value), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}

export function relativeTime(value) {
  if (!value) return "just now";
  try {
    return formatDistanceToNowStrict(parseISO(value), { addSuffix: true });
  } catch {
    return value;
  }
}

export function numberOrZero(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export function hoursToMinutes(value) {
  if (value === "" || value === null || typeof value === "undefined") return null;
  const hours = Number(value);
  if (!Number.isFinite(hours)) return 0;
  return Math.max(0, Math.round(hours * 60));
}

export function minutesToHoursValue(minutes) {
  if (minutes === null || typeof minutes === "undefined" || minutes === "") return "";
  const normalized = Number(minutes);
  if (!Number.isFinite(normalized)) return "";
  return (normalized / 60).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export function getTaskEstimateMinutes(task) {
  if (task?.estimateMinutes !== null && typeof task?.estimateMinutes !== "undefined") {
    return numberOrZero(task.estimateMinutes);
  }
  return numberOrZero(task?.estimateHours) * 60;
}

export function getTaskActualMinutes(task) {
  if (task?.actualMinutes !== null && typeof task?.actualMinutes !== "undefined") {
    return numberOrZero(task.actualMinutes);
  }
  if (task?.actualHours === null || typeof task?.actualHours === "undefined" || task?.actualHours === "") {
    return null;
  }
  return numberOrZero(task.actualHours) * 60;
}

export function formatMinutes(minutes, fallback = "0m") {
  if (minutes === null || typeof minutes === "undefined" || minutes === "") return fallback;
  const total = Math.max(0, Math.round(Number(minutes)));
  if (!Number.isFinite(total)) return fallback;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const aTime = Date.parse(a.updatedAt || a.createdAt || 0);
    const bTime = Date.parse(b.updatedAt || b.createdAt || 0);
    return bTime - aTime;
  });
}

export function isOverdueTask(task) {
  if (!task?.dueDate || task.status === "Done") return false;
  try {
    return isBefore(parseISO(task.dueDate), startOfDay(new Date()));
  } catch {
    return false;
  }
}

export function statusTone(status) {
  if (status === "Done") return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (status === "In Progress") return "bg-sky-500/15 text-sky-100 border-sky-400/30";
  return "bg-slate-500/15 text-slate-200 border-slate-300/20";
}

export function priorityTone(priority) {
  if (priority === "Critical") return "text-rose-200 bg-rose-500/15 border-rose-400/30";
  if (priority === "High") return "text-amber-100 bg-amber-500/15 border-amber-400/30";
  if (priority === "Medium") return "text-cyan-100 bg-cyan-500/15 border-cyan-400/30";
  return "text-slate-200 bg-slate-600/15 border-slate-400/20";
}

export function getLatestTaskNo(tasks) {
  return tasks.reduce((max, task) => {
    const match = String(task.taskNo || "").match(/^TNO-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
}

export function includesLabel(task, label) {
  return (task.labels || []).some((item) => String(item).toLowerCase() === label.toLowerCase());
}

export function groupByDay(tasks, key) {
  const map = new Map();
  tasks.forEach((task) => {
    if (!task[key]) return;
    const date = format(parseISO(task[key]), "dd MMM");
    map.set(date, (map.get(date) || 0) + 1);
  });
  return [...map.entries()].map(([label, count]) => ({ label, count }));
}

export function isWithinDateRange(value, start, end) {
  if (!value) return false;
  try {
    const date = parseISO(value);
    return !isBefore(date, start) && !isAfter(date, end);
  } catch {
    return false;
  }
}
