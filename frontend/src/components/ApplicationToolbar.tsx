import {
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { Status } from "../types/application";

type ApplicationToolbarProps = {
  activeStatus: Status | "All";
  setActiveStatus: (status: Status | "All") => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  viewMode: "list" | "board";
  setViewMode: (mode: "list" | "board") => void;
  statuses: Status[];
  statusCounts: Record<string, number>;
};

export default function ApplicationToolbar({
  activeStatus,
  setActiveStatus,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  statuses,
  statusCounts,
}: ApplicationToolbarProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveStatus("All")}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            activeStatus === "All"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          All <span className="ml-1">{statusCounts.All ?? 0}</span>
        </button>

        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              activeStatus === status
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {status}
            <span className="ml-1">{statusCounts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search company or role..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="company">Company A–Z</option>
          </select>

          <button
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={`rounded-lg p-2 ${
              viewMode === "list"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-white text-slate-500"
            }`}
          >
            <List className="h-4 w-4" />
          </button>

          <button
            onClick={() => setViewMode("board")}
            aria-label="Board view"
            className={`rounded-lg p-2 ${
              viewMode === "board"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-white text-slate-500"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}