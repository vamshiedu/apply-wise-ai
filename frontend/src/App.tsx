import AuthPage from "./components/AuthPage";
import StatsCards from "./components/StatsCard";

import api from "./api";
import { useEffect, useMemo, useState } from "react";
import type { Application, Status } from "./types/application";
import { statuses, statusStyles, formatDate, getLocalDateString, isFollowUpOverdue } from "./utils/applicationUtils";
import Sidebar from "./components/Sidebar";
import AddApplicationModal from "./components/AddApplicationModal";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Bell,
  CalendarDays,
  Trash2,
  Pencil,
  ExternalLink,
} from "lucide-react";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
  Boolean(localStorage.getItem("token")));
  const [activePage, setActivePage] = useState<"applications" | "reminders">("applications");
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  useEffect(() => {
  if (!isAuthenticated) {
    setApplications([]);
    setLoading(false);
    return;
  }

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/applications");
      setApplications(response.data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchApplications();
}, [isAuthenticated]);

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

        if (!isAuthenticated) {
        return (
          <AuthPage
            onAuthenticated={() => {
              setIsAuthenticated(true);
            }}
          />
        );
      }
      const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setApplications([]);
      };
              
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar activePage={activePage} onPageChange={setActivePage} />

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
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Logout
              </button>
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
            <StatsCards
                totalApplications={totalApplications}
                interviewCount={interviewCount}
                offerCount={offerCount}
                rejectedCount={rejectedCount}
                successRate={successRate}
                followUpsDue={followUpsDue}
                overdueFollowUps={overdueFollowUps}
              />          
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

export default App;
