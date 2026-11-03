type StatsCardsProps = {
  totalApplications: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  successRate: number;
  followUpsDue: number;
  overdueFollowUps: number;
};

export default function StatsCards({
  totalApplications,
  interviewCount,
  offerCount,
  rejectedCount,
  successRate,
  followUpsDue,
  overdueFollowUps,
}: StatsCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-500">
          Total Applications
        </p>
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
        <p className="mt-1 text-xs text-slate-500">Interview or offer</p>
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
  );
}