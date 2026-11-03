import type { Application, Status } from "../types/application";

export const statuses: Status[] = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

export const statusStyles: Record<Status, string> = {
  Saved: "bg-slate-100 text-slate-600",
  Applied: "bg-blue-50 text-blue-700",
  Interviewing: "bg-amber-50 text-amber-700",
  Offer: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
};

export function formatDate(date?: string) {
  if (!date) return "—";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isFollowUpOverdue(app: Application) {
  if (!app.followUpDate) return false;

  if (app.status === "Offer" || app.status === "Rejected") {
    return false;
  }

  const today = getLocalDateString();
  return app.followUpDate < today;
}
export const companyColors = [
  "bg-slate-100 text-slate-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
];

