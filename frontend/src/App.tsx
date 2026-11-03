import api from "./api";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  BriefcaseBusiness,
  Mail,
  FileText,
  BarChart3,
  Bell,
  X,
  CalendarDays,
  Trash2,
  Pencil,
  ExternalLink,
} from "lucide-react";

type Status =
  | "Saved"
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected";

type Application = {
  id: number;
  company: string;
  role: string;
  location: string;
  dateApplied: string;
  status: Status;
  color?: string;
  initials?: string;
  jobUrl?: string;
  followUpDate?: string;
};

const statuses: Status[] = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

const statusStyles: Record<Status, string> = {
  Saved: "bg-slate-100 text-slate-600",
  Applied: "bg-blue-50 text-blue-700",
  Interviewing: "bg-amber-50 text-amber-700",
  Offer: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
};

function formatDate(date?: string) {
  if (!date) return "—";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isFollowUpOverdue(app: Application) {
  if (!app.followUpDate) return false;

  if (app.status === "Offer" || app.status === "Rejected") {
    return false;
  }

  const today = getLocalDateString();
  return app.followUpDate < today;
}
const companyColors = [
  "bg-slate-100 text-slate-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
];

function App() {
  const [activePage, setActivePage] = useState<"applications" | "reminders">("applications");
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  useEffect(() => {
    api
      .get<Application[]>("/applications")
      .then((response) => setApplications(response.data))
      .catch((error) => {
        console.error("Failed to load applications:", error);
        alert("Could not load applications from the server.");
      })
      .finally(() => setLoading(false));
  }, []);

  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "board">("list");
  const [showModal, setShowModal] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);

  const filteredApplications = useMemo(() => {
  const filtered = applications.filter((app) => {
    const matchesStatus =
      activeStatus === "All" || app.status === activeStatus;

    const searchText = search.toLowerCase();

    const matchesSearch =
      app.company.toLowerCase().includes(searchText) ||
      app.role.toLowerCase().includes(searchText) ||
      app.location.toLowerCase().includes(searchText);


      return matchesStatus && matchesSearch;
  });

  return filtered.sort((a, b) => {
    if (sortBy === "newest") {
      return (b.dateApplied || "").localeCompare(a.dateApplied || "");
    }

    if (sortBy === "oldest") {
      return (a.dateApplied || "").localeCompare(b.dateApplied || "");
    }

    if (sortBy === "followUp") {
      return (a.followUpDate || "9999-12-31").localeCompare(
        b.followUpDate || "9999-12-31"
      );
    }

    return 0;
  });
}, [applications, activeStatus, search, sortBy]);

  async function saveApplication(application: Application) {
    const payload = {
      company: application.company,
      role: application.role,
      location: application.location,
      dateApplied: application.dateApplied,
      status: application.status,
      jobUrl: application.jobUrl ?? "",
      followUpDate: application.followUpDate ?? "",
    };

    try {
      if (editingApplication) {
        const response = await api.put<Application>(
          `/applications/${editingApplication.id}`,
          { ...payload, id: editingApplication.id }
        );

        setApplications((prev) =>
          prev.map((app) =>
            app.id === editingApplication.id ? response.data : app
          )
        );
      } else {
        const response = await api.post<Application>(
          "/applications",
          payload
        );

        setApplications((prev) => [response.data, ...prev]);
        setActiveStatus("All");
      }

      setShowModal(false);
      setEditingApplication(null);
    } catch (error) {
      console.error("Failed to save application:", error);
      alert("Could not save application. Please try again.");
    }
  }

  function openAddModal() {
    setEditingApplication(null);
    setShowModal(true);
  }

  function openEditModal(application: Application) {
    setEditingApplication(application);
    setShowModal(true);
  }

  async function updateStatus(id: number, status: Status) {
    const current = applications.find((app) => app.id === id);
    if (!current) return;

    try {
      const response = await api.put<Application>(
        `/applications/${id}`,
        {
          ...current,
          status,
        }
      );

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? response.data : app))
      );
      
    } catch (error) {
      console.error("Failed to update application status:", error);
      alert("Could not update status. Please try again.");
    }
  }

  async function deleteApplication(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/applications/${id}`);
      setApplications((prev) =>
        prev.filter((app) => app.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete application:", error);
      alert("Could not delete application. Please try again.");
    }
  }

  const counts = {
    All: applications.length,
    Saved: applications.filter((a) => a.status === "Saved").length,
    Applied: applications.filter((a) => a.status === "Applied").length,
    Interviewing: applications.filter((a) => a.status === "Interviewing").length,
    Offer: applications.filter((a) => a.status === "Offer").length,
    Rejected: applications.filter((a) => a.status === "Rejected").length,
    

  };
  const totalApplications = applications.length;

    const interviewCount = applications.filter(
      (app) => app.status === "Interviewing"
    ).length;

    const offerCount = applications.filter(
      (app) => app.status === "Offer"
    ).length;

    const rejectedCount = applications.filter(
      (app) => app.status === "Rejected"
    ).length;

    const successCount = applications.filter(
      (app) => app.status === "Interviewing" || app.status === "Offer"
    ).length;

    const successRate =
      totalApplications === 0
        ? 0
        : Math.round((successCount / totalApplications) * 100);

        const today = getLocalDateString();

        const followUpsDue = applications.filter(
          (app) =>
            app.followUpDate === today &&
            app.status !== "Offer" &&
            app.status !== "Rejected"
        ).length;

        const overdueFollowUps = applications.filter(
          (app) =>
            app.followUpDate &&
            app.followUpDate < today &&
            app.status !== "Offer" &&
            app.status !== "Rejected"
        ).length;

        
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-[232px] shrink-0 border-r border-slate-200/80 bg-white px-5 py-6 md:flex md:flex-col">
          <div className="mb-10 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <BriefcaseBusiness size={17} />
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              ApplyWise
            </span>
          </div>

          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </div>

          <nav className="space-y-0.5">
            <SidebarItem icon={<Mail size={17} />} label="Email Sync" />
            <SidebarItem icon={<FileText size={17} />} label="Resume Library" />
            <SidebarItem icon={<BarChart3 size={17} />} label="Insights" />
          </nav>

          <div className="mb-2 mt-8 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Personal
          </div>

          <nav className="space-y-0.5">
            <SidebarItem
              icon={<BriefcaseBusiness size={17} />}
              label="My Applications"
              active={activePage === "applications"}
              onClick={() => setActivePage("applications")}
            />

            <SidebarItem
              icon={<Bell size={17} />}
              label="Reminders"
              active={activePage === "reminders"}
              onClick={() => setActivePage("reminders")}
            />
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <p className="px-2 text-xs leading-5 text-slate-500">
              Keep your search organized. Connect email sync when you’re ready.
            </p>
            <button className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
              Connect Gmail
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
            <div className="text-sm text-slate-500">
              Workspace <span className="mx-2 text-slate-300">/</span>
              <span className="font-medium text-slate-800">
                {activePage === "applications" ? "My Applications" : "Reminders"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative rounded-md p-2 text-slate-500 transition hover:bg-slate-100">
                <Bell size={18} />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                V
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-9">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-[25px] font-semibold tracking-tight text-slate-900">
                  {activePage === "applications" ? "My Applications" : "Reminders"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {activePage === "applications"
                    ? "Keep track of your job search in one place."
                    : "Stay on top of follow-ups and next steps."}
                </p>
              </div>

              {activePage === "applications" && (
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                >
                  <Plus size={17} />
                  Add application
                </button>
              )}
            </div>

            {activePage === "applications" && (
              <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-500">Total Applications</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {totalApplications}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-500">Interviews</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {interviewCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-500">Offers</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {offerCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-500">Rejected</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {rejectedCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-500">Success Rate</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {successRate}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Interview or offer
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-500">Follow-ups Due</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {followUpsDue + overdueFollowUps}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {followUpsDue} today · {overdueFollowUps} overdue
                </p>
              </div>
               </div>           
            <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
              {["All", ...statuses].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm ${
                    activeStatus === status
                      ? "border-slate-900 font-semibold text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {status}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[11px] ${
                      activeStatus === status
                        ? "bg-slate-100 text-slate-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {counts[status as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative min-w-[220px] flex-1 sm:max-w-md">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search company, role or location..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                  <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600"
                    >
                      <option value="newest">Newest applied</option>
                      <option value="oldest">Oldest applied</option>
                      <option value="followUp">Follow-up date (soonest)</option>
                    </select>
                  <button
                    onClick={() => setView("list")}
                    className={`rounded-md p-1.5 ${
                      view === "list"
                        ? "bg-slate-100 text-slate-700"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    aria-label="List view"
                  >
                    <List size={17} />
                  </button>
                  <button
                    onClick={() => setView("board")}
                    className={`rounded-md p-1.5 ${
                      view === "board"
                        ? "bg-slate-100 text-slate-700"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    aria-label="Board view"
                  >
                    <LayoutGrid size={17} />
                  </button>
                </div>
              </div>
            </div>
              </>
            )}
            
            {activePage === "reminders" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-rose-100 bg-white p-4">
                    <p className="text-sm font-medium text-slate-500">Overdue</p>
                    <p className="mt-1 text-2xl font-semibold text-rose-600">{overdueFollowUps}</p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-white p-4">
                    <p className="text-sm font-medium text-slate-500">Due today</p>
                    <p className="mt-1 text-2xl font-semibold text-amber-600">{followUpsDue}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-500">Upcoming</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {applications.filter((app) => app.followUpDate && app.followUpDate > today && app.status !== "Offer" && app.status !== "Rejected").length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">All follow-ups</h2>
                  <span className="text-sm text-slate-500">
                    {applications.filter((app) => app.followUpDate && app.status !== "Offer" && app.status !== "Rejected").length} scheduled
                  </span>
                </div>

                {applications.filter(
                  (app) =>
                    app.followUpDate &&
                    app.status !== "Offer" &&
                    app.status !== "Rejected"
                ).length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    <p className="font-medium text-slate-700">No follow-ups scheduled</p>
                    <p className="mt-1">Add a follow-up date to an application to see it here.</p>
                  </div>
                ) : (
                  applications
                    .filter(
                      (app) =>
                        app.followUpDate &&
                        app.status !== "Offer" &&
                        app.status !== "Rejected"
                    )
                    .sort((a, b) =>
                      (a.followUpDate ?? "").localeCompare(b.followUpDate ?? "")
                    )
                    .map((app) => (
                      <div
                        key={app.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div>
                          <p className="font-medium text-slate-800">{app.company}</p>
                          <p className="text-sm text-slate-500">{app.role}</p>
                          <p className={`mt-1 text-xs font-medium ${
                            app.followUpDate < today
                              ? "text-rose-600"
                              : app.followUpDate === today
                              ? "text-amber-600"
                              : "text-slate-500"
                          }`}>
                            {app.followUpDate < today
                              ? "Overdue"
                              : app.followUpDate === today
                              ? "Due today"
                              : "Upcoming"} · {formatDate(app.followUpDate)}
                          </p>
                        </div>

                        <button
                          onClick={() => openEditModal(app)}
                          className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      </div>
                    ))
                )}
              </div>
            ) : loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Loading applications...
              </div>
            ) : view === "list" ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Company / Role
                        </th>
                        <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Location
                        </th>
                        <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Date applied
                        </th>
                        <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>
                        <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Next step
                        </th>
                        <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                  Follow-up
                        </th>
                        <th className="px-3 py-3" />
                      </tr>
                    </thead>

                    <tbody>
                      {filteredApplications.map((app) => (
                        <tr
                          key={app.id}
                          className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${
                                  app.color ?? "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {app.initials ??
                                  app.company.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-800">
                                  {app.company}
                                </div>
                                <div className="mt-0.5 max-w-[320px] truncate text-xs text-slate-500">
                                  {app.role}
                                  <div>{app.jobUrl && (
                                      <a
                                        href={app.jobUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                                      >
                                        View job <ExternalLink size={12} />
                                      </a>
                                    )}</div>
                                </div>
                                
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {app.location}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatDate(app.dateApplied)}
                          </td>

                          <td className="px-4 py-4">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                updateStatus(app.id, e.target.value as Status)
                              }
                              className={`rounded-full border-0 px-2.5 py-1.5 text-xs font-medium outline-none ${
                                statusStyles[app.status]
                              }`}
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-500">
                            {app.status === "Interviewing" ? (
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                Prepare for interview
                              </span>
                            ) : app.status === "Saved" ? (
                              "Apply when ready"
                            ) : app.status === "Offer" ? (
                              "Review offer"
                            ) : app.status === "Rejected" ? (
                              "No action"
                            ) : (
                              "Await response"
                            )}
                          </td>
                          <td
                              className={`px-4 py-4 text-sm ${
                                isFollowUpOverdue(app)
                                  ? "font-medium text-rose-600"
                                  : "text-slate-600"
                              }`}
                            >
                              {isFollowUpOverdue(app) ? "Overdue · " : ""}
                              {formatDate(app.followUpDate)}
                            </td>
                          <td className="px-3 py-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(app)}
                                title="Edit application"
                                aria-label={`Edit ${app.company} application`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteApplication(app.id)}
                                title="Delete application"
                                aria-label={`Delete ${app.company} application`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                </div>

                {filteredApplications.length === 0 && (
                  <div className="py-14 text-center">
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      No applications found
                    </div>
                    <p className="text-sm text-slate-500">
                      Try another search or add an application.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                  <span>
                    Showing {filteredApplications.length} of{" "}
                    {applications.length} applications
                  </span>
                  <span>Updated just now</span>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 xl:grid-cols-5">
                {statuses.map((status) => {
                  const items = filteredApplications.filter(
                    (app) => app.status === status
                  );

                  return (
                    <div
                      key={status}
                      className="min-h-[260px] rounded-lg border border-slate-200 bg-slate-100/70 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between px-1">
                        <span className="text-sm font-semibold text-slate-700">
                          {status}
                        </span>
                        <span className="rounded-md bg-white px-2 py-0.5 text-xs text-slate-500">
                          {items.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {items.map((app) => (
                          <div
                            key={app.id}
                            className="rounded-md border border-slate-200 bg-white p-3 transition-shadow hover:shadow-sm"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${
                                  app.color ?? "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {app.initials ??
                                  app.company.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold">
                                {app.company}
                              </span>
                            </div>

                            <p className="text-xs leading-5 text-slate-600">
                              {app.role}
                            </p>
                            <p className="mt-2 text-[11px] text-slate-400">
                              {formatDate(app.dateApplied)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 text-xs text-slate-400">
              Your application data is synced with your account.
            </div>
          </div>
        </main>
      </div>      {showModal && (
        <AddApplicationModal
          initialApplication={editingApplication}
          onClose={() => {
            setShowModal(false);
            setEditingApplication(null);
          }}
          onSave={saveApplication}
        />
      )}
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
        active
          ? "bg-slate-100 font-medium text-slate-900"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}


function AddApplicationModal({
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

export default App;