import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { mockAgents, mockTasks, mockROI } from "@/lib/mock-data";
// TODO: replace with live API call to /api/v1/roi, /api/v1/tasks, /api/v1/agents

export default function DashboardPage() {
  const activeAgents = mockAgents.length;
  const openTasks = mockTasks.filter((t) => t.status !== "completed").length;
  const latestROI = mockROI[mockROI.length - 1];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="A quick look at what your agents are working on." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="text-xs text-muted">Active agents</div>
          <div className="mt-2 text-2xl font-semibold">{activeAgents}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Open tasks</div>
          <div className="mt-2 text-2xl font-semibold">{openTasks}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Hours saved (MTD)</div>
          <div className="mt-2 text-2xl font-semibold">{latestROI.hoursSaved}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Pending approvals</div>
          <div className="mt-2 text-2xl font-semibold">2</div>
        </div>
      </div>

      <div className="mt-8 card p-5">
        <div className="mb-3 text-sm font-semibold">Recent tasks</div>
        <div className="divide-y divide-border">
          {mockTasks.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">{t.title}</div>
                <div className="agent-name mt-0.5 text-xs text-muted">{t.agent}</div>
              </div>
              <Badge value={t.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
