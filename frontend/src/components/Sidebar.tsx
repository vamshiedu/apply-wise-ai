import { BriefcaseBusiness, Mail, FileText, BarChart3, Bell } from "lucide-react";

type SidebarProps = {
  activePage: "applications" | "reminders";
  onPageChange: (page: "applications" | "reminders") => void;
};

function SidebarItem({
  icon, label, active = false, onClick,
}: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${active ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
      {icon}{label}
    </button>
  );
}

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
  return (
    <aside className="hidden w-[232px] shrink-0 border-r border-slate-200/80 bg-white px-5 py-6 md:flex md:flex-col">
      <div className="mb-10 flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white"><BriefcaseBusiness size={17} /></div>
        <span className="text-base font-semibold tracking-tight text-slate-900">ApplyWise</span>
      </div>
      <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workspace</div>
      <nav className="space-y-0.5">
        <SidebarItem icon={<Mail size={17} />} label="Email Sync" />
        <SidebarItem icon={<FileText size={17} />} label="Resume Library" />
        <SidebarItem icon={<BarChart3 size={17} />} label="Insights" />
      </nav>
      <div className="mb-2 mt-8 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Personal</div>
      <nav className="space-y-0.5">
        <SidebarItem icon={<BriefcaseBusiness size={17} />} label="My Applications" active={activePage === "applications"} onClick={() => onPageChange("applications")} />
        <SidebarItem icon={<Bell size={17} />} label="Reminders" active={activePage === "reminders"} onClick={() => onPageChange("reminders")} />
      </nav>
      <div className="mt-auto border-t border-slate-100 pt-4">
        <p className="px-2 text-xs leading-5 text-slate-500">Keep your search organized. Connect email sync when you’re ready.</p>
        <button className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">Connect Gmail</button>
      </div>
    </aside>
  );
}
