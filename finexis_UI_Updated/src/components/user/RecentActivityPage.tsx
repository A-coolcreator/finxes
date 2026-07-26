import Topbar from "./Topbar";
import { useCaseContext } from "../../context/CaseContext";
import { formatRelative } from "../../lib/formatters";

export default function RecentActivityPage() {
  const { cases, workspace, setPage } = useCaseContext();
  const activity = [
    ...cases.slice(0, 5).map((record) => ({
      text: `Case ${record.caseNumber} updated with ${record.triggerCount || 0} indexed transactions`,
      time: formatRelative(record.updatedAt || record.createdAt),
    })),
    ...(workspace?.recentActivity || []),
  ];

  return (
    <div>
      <Topbar title="Recent Activity" subtitle="Case updates from the backend" />
      <div className="px-5 py-6 lg:px-8 lg:py-8">
        <div className="rounded-xl border border-line bg-surface shadow-card">
          <ul className="divide-y divide-line-soft">
            {activity.map((item, index) => (
              <li key={index} className="flex items-start justify-between gap-3 px-5 py-4">
                <p className="text-[13px] text-ink">{item.text}</p>
                <span className="text-[12px] text-ink-faint whitespace-nowrap">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={() => setPage("case-manager")} className="mt-4 text-[13px] font-medium text-forensic-500 hover:text-forensic-600">
          Open case manager
        </button>
      </div>
    </div>
  );
}
