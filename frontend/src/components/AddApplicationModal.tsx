import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { X } from "lucide-react";
import type { Application, Status } from "../types/application";
import { statuses, getLocalDateString, companyColors } from "../utils/applicationUtils";


export default function AddApplicationModal({
  onClose,
  onSave,
  initialApplication,
}: {
  onClose: () => void;
  onSave: (application: Application) => void;
  initialApplication: Application | null;
}) {
  const isEditing = Boolean(initialApplication);
  const [company, setCompany] = useState(initialApplication?.company ?? "");
  const [role, setRole] = useState(initialApplication?.role ?? "");
  const [location, setLocation] = useState(initialApplication?.location ?? "");
  const [status, setStatus] = useState<Status>(
    initialApplication?.status ?? "Applied"
  );
  const [date, setDate] = useState(
    initialApplication?.dateApplied ??
      getLocalDateString()
  );

  const [jobUrl, setJobUrl] = useState(initialApplication?.jobUrl ?? "");
  const [followUpDate, setFollowUpDate] = useState(
    initialApplication?.followUpDate ?? ""
  );
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    onSave({
      id: initialApplication?.id ?? Date.now(),
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || "Not specified",
      dateApplied: date,
      status,
      jobUrl: jobUrl.trim(),
      color:
        initialApplication?.color ??
        companyColors[Math.floor(Math.random() * companyColors.length)],
      initials: company.trim().charAt(0).toUpperCase(),
      followUpDate,
    });
  }
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? "Edit application" : "Add application"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update the details for this role."
                : "Save a job to your application tracker."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Company">
            <input
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              className="form-input"
            />
          </FormField>

          <FormField label="Job title">
            <input
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="form-input"
            />
          </FormField>

          <FormField label="Location">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hyderabad, India"
              className="form-input"
            />
          </FormField>

          <FormField label="Job posting URL">
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://company.com/jobs/..."
              className="form-input"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="form-input"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Date applied">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </FormField>
            <FormField label="Follow-up date">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="form-input"
                />
              </FormField>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              {isEditing ? "Save changes" : "Add application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

