import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, ChevronDown, ChevronRight, Clock3, Layers3, MessageSquare, Plus, Rocket, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Button, Card, TabsShell } from "../components/ui";
import {
  cn,
  formatDate,
  formatDateTime,
  formatMinutes,
  getTaskActualMinutes,
  getTaskEstimateMinutes,
  isOverdueTask,
  numberOrZero,
} from "../lib/utils";

const STATUS_OPTIONS = ["Backlog", "In Progress", "Done"];
const CHART_COLORS = ["#2160ff", "#71e6b6", "#f15a24", "#b219cb", "#df9e00"];

export function MiniMetric({ label, value }) {
  return (
    <div className="rounded-[16px] border border-[#ececf0] bg-[#fafafa] px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f9098]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#23242a]">{value}</p>
    </div>
  );
}

export function HealthBadge({ status, score }) {
  const tone =
    status === "Delayed"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : status === "At Risk"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return <Badge className={cn("px-3 py-1 text-sm", tone)}>{status} · {score}</Badge>;
}

export function SparkKpiCard({ icon: Icon, label, value, series, tone = "default" }) {
  const toneMap = {
    default: "text-[#2160ff]",
    emerald: "text-emerald-600",
    sky: "text-sky-600",
    amber: "text-amber-600",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8f9098]">{label}</p>
          <p className="mt-2 text-[28px] font-semibold text-[#23242a]">{value}</p>
        </div>
        <Icon className={cn("h-5 w-5", toneMap[tone] || toneMap.default)} />
      </div>
      <div className="mt-3 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <Line type="monotone" dataKey="value" stroke="#2160ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function AnalyticsPanel({ analytics }) {
  const [range, setRange] = useState("week");
  const series = analytics.productivity[range];
  const peak = analytics.productivityPeak[range];
  const totalDone = series.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#23242a]">Productivity</p>
          <p className="text-sm text-[#7b7c85]">Completed tasks grouped by day, week, or month.</p>
        </div>
        <TabsShell
          value={range}
          onValueChange={setRange}
          tabs={[
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
        >
          <div />
        </TabsShell>
      </div>
      <div className="mt-4 space-y-3">
        <div className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#8f9098]">
                {range === "day" ? "Last 7 Days" : range === "week" ? "Last 5 Weeks" : "Last 6 Months"}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#23242a]">{totalDone} tasks completed</p>
            </div>
            <Badge className="border-[#dfe7ff] bg-[#eef4ff] text-[#2160ff]">Productivity</Badge>
          </div>
          <div className="h-[286px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2160ff" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#2160ff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#efeff2" vertical={false} />
                <XAxis dataKey="label" stroke="#9a9aa2" tickLine={false} axisLine={false} interval={0} minTickGap={20} />
                <YAxis stroke="#9a9aa2" tickLine={false} axisLine={false} allowDecimals={false} domain={[0, "dataMax + 1"]} />
                <Tooltip formatter={(value, name) => [`${value}`, name === "createdCount" ? "Created" : "Completed"]} labelFormatter={(label) => `Period: ${label}`} />
                <Area type="monotone" dataKey="count" stroke="#2160ff" strokeWidth={2.5} fill="url(#analyticsFill)" />
                <Line type="monotone" dataKey="createdCount" stroke="#2fb36d" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
          <div className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-3.5">
            <p className="text-sm text-[#7b7c85]">Peak period</p>
            <p className="mt-1 text-[26px] font-semibold text-[#23242a]">{peak.count}</p>
            <p className="text-sm text-[#7b7c85]">{peak.label}</p>
          </div>
          <div className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-3.5">
            <p className="text-sm text-[#7b7c85]">Open subtasks</p>
            <p className="mt-1 text-[26px] font-semibold text-[#23242a]">{analytics.openSubtasks}</p>
            <p className="text-sm text-[#7b7c85]">Still active in current scope</p>
          </div>
          <div className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-3.5">
            <p className="text-sm text-[#7b7c85]">Upcoming load</p>
            <p className="mt-1 text-[26px] font-semibold text-[#23242a]">{analytics.inProgress + analytics.overdue}</p>
            <p className="text-sm text-[#7b7c85]">In progress plus overdue work</p>
          </div>
          <div className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-3.5">
            <p className="text-sm text-[#7b7c85]">Execution spread</p>
            <div className="mt-2 h-[92px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthSeries} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="count" fill="#71e6b6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CumulativeFlowCard({ analytics }) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#23242a]">Cumulative Flow</p>
        <p className="text-sm text-[#7b7c85]">Backlog, in progress, and done trend over the last 14 days.</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics.cumulativeFlow} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#efeff2" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="backlog" stackId="1" stroke="#f15a24" fill="#f15a2422" />
            <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#2160ff" fill="#2160ff22" />
            <Area type="monotone" dataKey="done" stackId="1" stroke="#71e6b6" fill="#71e6b622" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function SprintBurndownCard({ analytics, sprint }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#23242a]">Sprint Burndown</p>
          <p className="text-sm text-[#7b7c85]">{sprint ? sprint.name : "No active sprint in scope"}</p>
        </div>
        <Badge className="border-[#ececf0] bg-[#f5f5f7] text-[#62636b]">{analytics.sprintPredictability}% predictable</Badge>
      </div>
      {analytics.burndownSeries.length ? (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.burndownSeries} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#efeff2" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="ideal" stroke="#bdbec5" strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="remaining" stroke="#2160ff" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="completed" stroke="#2fb36d" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyStateWidget title="No sprint burndown yet" body="Start a sprint and commit tasks to see burndown tracking." />
      )}
    </Card>
  );
}

export function HeatmapCard({ analytics }) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#23242a]">Completion Heatmap</p>
        <p className="text-sm text-[#7b7c85]">Daily completion density for the last four weeks.</p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {analytics.heatmapSeries.map((cell) => (
          <div key={cell.key} className="space-y-1">
            <div
              className="h-10 rounded-[14px] border border-[#ececf0]"
              title={`${cell.label}: ${cell.count} completed`}
              style={{
                backgroundColor: cell.count === 0 ? "#f6f6f8" : cell.count === 1 ? "#dfe8ff" : cell.count === 2 ? "#aecaff" : "#2160ff",
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DeadlineLaneCard({ analytics, openTask }) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#23242a]">Deadline Lane</p>
        <p className="text-sm text-[#7b7c85]">Upcoming due work in time order.</p>
      </div>
      <div className="space-y-3">
        {analytics.deadlineLane.length ? (
          analytics.deadlineLane.map((item) => (
            <button
              key={item.id}
              onClick={() => openTask(item.id)}
              className="flex w-full items-center justify-between rounded-[16px] border border-[#ececf0] bg-[#fafafa] px-4 py-3 text-left transition hover:bg-white"
            >
              <div>
                <p className="font-medium text-[#23242a]">{item.title}</p>
                <p className="mt-1 text-sm text-[#7b7c85]">{item.projectName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#23242a]">{formatDate(item.dueDate, "No due date")}</p>
                <p className="text-xs text-[#8f9098]">{item.daysLeft}</p>
              </div>
            </button>
          ))
        ) : (
          <EmptyStateWidget title="No upcoming deadlines" body="Tasks with due dates will appear here in timeline order." />
        )}
      </div>
    </Card>
  );
}

export function MixCard({ title, data }) {
  const normalizedData = data.map((item) => ({
    name: item.name ?? item.label ?? "Unknown",
    value: numberOrZero(item.value ?? item.count),
  }));

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#23242a]">{title}</p>
        <Badge className="border-[#ececf0] bg-[#f5f5f7] text-[#62636b]">{normalizedData.reduce((sum, item) => sum + item.value, 0)}</Badge>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={normalizedData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
              {normalizedData.map((entry, index) => (
                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {normalizedData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
              <span className="text-[#62636b]">{item.name}</span>
            </div>
            <span className="font-medium text-[#23242a]">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function InsightSnapshotCard({ analytics, className }) {
  const metrics = [
    { label: "Overdue Rate", value: `${analytics.overdueRate}%` },
    { label: "Estimate Accuracy", value: analytics.estimateAccuracy },
    { label: "AI Usage", value: analytics.aiUsageCount },
    { label: "Completion Rate", value: `${analytics.completionRate}%` },
    { label: "Throughput 7d", value: analytics.throughput7d },
    { label: "Lead Time", value: `${analytics.avgLeadTime}d` },
    { label: "Reopen Rate", value: `${analytics.reopenRate}%` },
    { label: "Subtask Ratio", value: `${analytics.subtaskCompletionRatio}%` },
  ];

  return (
    <Card className={cn("p-5", className)}>
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#23242a]">Insight Snapshot</p>
        <p className="text-sm text-[#7b7c85]">Compact operational signals for the current scope.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f9098]">{metric.label}</p>
            <p className="mt-2 text-[28px] font-semibold leading-none text-[#23242a]">{metric.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ProjectCardList({ projects, allTasks }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#23242a]">Project health</p>
          <p className="text-sm text-[#7b7c85]">Progress and risk at project level.</p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-[#2160ff]" />
      </div>
      <div className="space-y-3">
        {projects.length ? (
          projects.map((project) => {
            const projectTasks = allTasks.filter((task) => task.projectId === project.$id);
            const done = projectTasks.filter((task) => task.status === "Done").length;
            const overdue = projectTasks.filter(isOverdueTask).length;
            const progress = Math.round((done / Math.max(1, projectTasks.length)) * 100);
            const status = overdue > 2 ? "Delayed" : overdue > 0 ? "At Risk" : "On Track";
            return (
              <div key={project.$id} className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || "#2160ff" }} />
                    <p className="font-semibold text-[#23242a]">{project.name}</p>
                  </div>
                  <HealthBadge status={status} score={progress} />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eceff6]">
                  <div className="h-full rounded-full bg-[#2160ff]" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#7b7c85]">
                  <span>{done} done</span>
                  <span>{overdue} overdue</span>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyStateWidget title="No project cards yet" body="Create a project to see health, progress, and risk summary here." />
        )}
      </div>
    </Card>
  );
}

export function AssigneeCapacityCard({ analytics }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#23242a]">Assignee Capacity Study</p>
          <p className="text-sm text-[#7b7c85]">Planned vs actual hours by owner in the current scope.</p>
        </div>
        <Badge className="border-[#dfe7ff] bg-[#eef4ff] text-[#2160ff]">Capacity</Badge>
      </div>
      <div className="h-[280px]">
        {analytics.assigneeLoad?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.assigneeLoad} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#efeff2" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(value, name) => [`${numberOrZero(value)}h`, name === "plannedHours" ? "Planned" : "Actual"]} />
              <Bar dataKey="plannedHours" fill="#2160ff" radius={[8, 8, 0, 0]} />
              <Bar dataKey="actualHours" fill="#71e6b6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyStateWidget title="No assignee load yet" body="Assign tasks to users and this workload chart becomes useful immediately." />
        )}
      </div>
    </Card>
  );
}

export function RiskRadarCard({ analytics }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#23242a]">Risk Radar</p>
          <p className="text-sm text-[#7b7c85]">Overdue, unassigned, and near-due work in one triage view.</p>
        </div>
        <AlertCircle className="h-5 w-5 text-[#f15a24]" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analytics.riskBreakdown || []} dataKey="value" nameKey="name" innerRadius={48} outerRadius={74} paddingAngle={4}>
                {(analytics.riskBreakdown || []).map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {(analytics.riskBreakdown || []).map((item, index) => (
            <div key={item.name} className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <p className="text-sm font-medium text-[#23242a]">{item.name}</p>
                </div>
                <span className="text-xl font-semibold text-[#23242a]">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function SprintStrategyRailCard({ analytics }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#23242a]">Sprint Strategy Rail</p>
          <p className="text-sm text-[#7b7c85]">Sprint buckets with health, completion, and rollover signals.</p>
        </div>
        <Layers3 className="h-5 w-5 text-[#2160ff]" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {(analytics.sprintCards || []).map((sprint) => (
          <div key={sprint.$id} className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#23242a]">{sprint.name}</p>
                <p className="mt-1 text-xs text-[#8f9098]">{sprint.status || "Scope bucket"}</p>
              </div>
              <HealthBadge status={sprint.health?.status || "On Track"} score={sprint.health?.score ?? 100} />
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <div className="rounded-[14px] border border-[#ececf0] bg-white px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f9098]">Committed</p>
                <p className="mt-1 text-lg font-semibold text-[#23242a]">{sprint.committed}</p>
              </div>
              <div className="rounded-[14px] border border-[#ececf0] bg-white px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f9098]">Done</p>
                <p className="mt-1 text-lg font-semibold text-[#23242a]">{sprint.completed}</p>
              </div>
              <div className="rounded-[14px] border border-[#ececf0] bg-white px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f9098]">Rollover</p>
                <p className="mt-1 text-lg font-semibold text-[#23242a]">{sprint.rollover}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DeliveryTimeReviewCard({ analytics }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#23242a]">Delivery Time Review</p>
          <p className="text-sm text-[#7b7c85]">Planned vs actual execution time by assignee.</p>
        </div>
        <Clock3 className="h-5 w-5 text-[#2160ff]" />
      </div>
      <div className="h-[260px]">
        {analytics.assigneeLoad?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.assigneeLoad} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#efeff2" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [`${numberOrZero(value)}h`, "Hours"]} />
              <Line type="monotone" dataKey="plannedHours" stroke="#2160ff" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="actualHours" stroke="#71e6b6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyStateWidget title="No time comparison yet" body="Once planned and actual time are tracked on tasks, this becomes a useful retrospective card." />
        )}
      </div>
    </Card>
  );
}

export function PersonalFocusDistributionCard({ analytics, currentUser }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#23242a]">Personal Focus / Team Distribution</p>
          <p className="text-sm text-[#7b7c85]">Your current queue with quick team distribution underneath.</p>
        </div>
        <Users className="h-5 w-5 text-[#2160ff]" />
      </div>
      <div className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#23242a]">{analytics.myFocus?.name || currentUser?.name || currentUser?.email || "My Focus"}</p>
            <p className="mt-1 text-sm text-[#7b7c85]">Assigned work in the current scope.</p>
          </div>
          <CheckCircle2 className="h-4 w-4 text-[#71e6b6]" />
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <MiniMetric label="Open" value={analytics.myFocus?.openCount ?? 0} />
          <MiniMetric label="Overdue" value={analytics.myFocus?.overdueCount ?? 0} />
          <MiniMetric label="Done" value={analytics.myFocus?.doneCount ?? 0} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-[#7b7c85]">
          <span>Planned {formatMinutes(analytics.myFocus?.plannedMinutes ?? 0)}</span>
          <span>Actual {formatMinutes(analytics.myFocus?.actualMinutes ?? 0)}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {analytics.assigneeLoad?.length ? (
          analytics.assigneeLoad.map((person) => (
            <div key={person.key || person.label} className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[#23242a]">{person.label}</p>
                <span className="text-xs text-[#8f9098]">{person.openCount} open</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-[#23242a]">{person.count}</p>
              <p className="text-sm text-[#7b7c85]">tasks in current scope</p>
              <div className="mt-3 flex items-center justify-between text-sm text-[#7b7c85]">
                <span>Planned {formatMinutes(person.planned)}</span>
                <span>Actual {formatMinutes(person.actual)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyStateWidget title="No team distribution yet" body="As soon as more assignees are active, this card becomes a strong work-distribution view." />
          </div>
        )}
      </div>
    </Card>
  );
}

export function EmptyStateWidget({ title, body }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#dfe0e5] bg-[#fafafa] px-5 py-8 text-center">
      <p className="text-sm font-semibold text-[#23242a]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#7b7c85]">{body}</p>
    </div>
  );
}

export function AuditTimeline({ entries, title = "Audit timeline" }) {
  return (
    <Card className="border border-[#e8e8ec] bg-white p-5">
      <div className="mb-4">
        <p className="text-lg font-semibold text-[#23242a]">{title}</p>
        {/* <p className="text-sm text-[#7b7c85]">Status, priority, label, comment, and AI activity history.</p> */}
      </div>
      <div className="space-y-3">
        {entries.length ? (
          entries.map((entry) => (
            <div key={entry.$id} className="rounded-[16px] border border-[#ececf0] bg-[#fafafa] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#23242a]">{entry.message}</p>
                <Badge className="border-[#ececf0] bg-white text-[#5f6169]">{entry.actionType}</Badge>
              </div>
              <p className="mt-1 text-xs text-[#8f9098]">{formatDateTime(entry.createdAt)}</p>
            </div>
          ))
        ) : (
          <EmptyStateWidget title="No audit events yet" body="Task changes, comments, and AI actions will appear here automatically." />
        )}
      </div>
    </Card>
  );
}

export function ButtonStudyGroup({ selected, onSelect, className = "", expandedId = null, onHoverChange = null, flatActive = false }) {
  const options = [
    { id: "create", label: "New Task", icon: Plus },
    { id: "sprint", label: "New Sprint", icon: Rocket },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <div className={cn("testing-lab-google-frame inline-flex items-center border-transparent bg-[#f5f5f7] p-1 hover:!border-transparent", className)}>
      {options.map((option) => {
        const Icon = option.icon;
        const active = (expandedId || selected) === option.id;
        if (active) {
          return (
            <Button
              key={option.id}
              variant="poster"
              className={cn(
                "h-10 w-[152px] justify-start overflow-hidden rounded-full px-4 text-sm transition-[width,background-color,color,transform,filter,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                flatActive && "hover:translate-y-0",
              )}
              onClick={() => onSelect(option.id)}
              onMouseEnter={() => onHoverChange?.(option.id)}
              onMouseLeave={() => onHoverChange?.(null)}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{option.label}</span>
            </Button>
          );
        }
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-[#70717a] transition-[width,background-color,color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white hover:text-[#23242a]"
            aria-label={option.label}
            title={option.label}
            onMouseEnter={() => onHoverChange?.(option.id)}
            onMouseLeave={() => onHoverChange?.(null)}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

export function ManageWorkbenchPreview({ tasks, sprints, projects, selectedProject, openTask, onStatusChange }) {
  const TASKS_PER_PAGE = 10;
  const sprintLookup = useMemo(() => {
    const buckets = sprints.map((sprint) => ({
      key: sprint.$id,
      label: sprint.name,
      status: sprint.status,
      tasks: tasks.filter((task) => task.sprintId === sprint.$id),
    }));
    const noSprintTasks = tasks.filter((task) => !task.sprintId);
    return [
      {
        key: "all-sprints",
        label: "All Sprints",
        status: selectedProject ? selectedProject.name : "Cross Sprint",
        tasks,
      },
      ...buckets,
      {
        key: "no-sprint",
        label: "No Sprint",
        status: "Open Pool",
        tasks: noSprintTasks,
      },
    ].filter((bucket) => bucket.tasks.length > 0);
  }, [selectedProject, sprints, tasks]);

  const [activeBucket, setActiveBucket] = useState(() => sprintLookup[0]?.key || "no-sprint");
  const [taskView, setTaskView] = useState("open");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!sprintLookup.find((bucket) => bucket.key === activeBucket)) {
      setActiveBucket(sprintLookup[0]?.key || "no-sprint");
    }
  }, [activeBucket, sprintLookup]);

  const activeGroup = sprintLookup.find((bucket) => bucket.key === activeBucket) || sprintLookup[0] || null;
  const visibleTasks = useMemo(() => {
    if (!activeGroup) return [];
    const scoped = activeGroup.tasks.slice().sort((left, right) => new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0));
    if (taskView === "all") return scoped;
    if (taskView === "done") return scoped.filter((task) => task.status === "Done");
    if (taskView === "overdue") return scoped.filter(isOverdueTask);
    return scoped.filter((task) => task.status !== "Done");
  }, [activeGroup, taskView]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeBucket, taskView]);

  const totalPages = Math.max(1, Math.ceil(visibleTasks.length / TASKS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    return visibleTasks.slice(startIndex, startIndex + TASKS_PER_PAGE);
  }, [currentPage, visibleTasks]);

  const pageWindow = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return Array.from({ length: 5 }, (_, index) => totalPages - 4 + index);
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }, [currentPage, totalPages]);

  const projectLookup = useMemo(() => new Map(projects.map((project) => [project.$id, project])), [projects]);

  return (
    <Card className="overflow-hidden p-0">
      {/* <div className="border-b border-[#ececf0] bg-[linear-gradient(180deg,#ffffff,#fafbff)] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="border-[#ececf0] bg-white text-[#5f6169]">{selectedProject ? selectedProject.name : "All Projects"}</Badge>
            <Badge className="border-[#ececf0] bg-white text-[#5f6169]">{tasks.length} tasks</Badge>
          </div>
        </div>
      </div> */}

      <div className="grid min-h-[620px] min-w-0 xl:grid-cols-[250px_minmax(0,1fr)]">
        <div className="border-r border-[#ececf0] bg-[#fbfbfc] p-3">
          <div className="space-y-1.5">
            {sprintLookup.map((bucket) => {
              const done = bucket.tasks.filter((task) => task.status === "Done").length;
              const active = activeBucket === bucket.key;
              const progress = Math.round((done / Math.max(1, bucket.tasks.length)) * 100);
              return (
                <button
                  key={bucket.key}
                  type="button"
                  onClick={() => setActiveBucket(bucket.key)}
                  className={cn(
                    "w-full rounded-[16px] border px-3 py-2.5 text-left transition",
                    active
                      ? "border-[#d7ddeb] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]"
                      : "border-transparent bg-transparent hover:border-[#e6e8ef] hover:bg-white/80",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          bucket.key === "all-sprints"
                            ? "bg-[#2160ff]"
                            : bucket.key === "no-sprint"
                              ? "bg-[#9aa1af]"
                              : bucket.status === "Active"
                                ? "bg-[#2f7d4f]"
                                : bucket.status === "Planning"
                                  ? "bg-[#2160ff]"
                                  : "bg-[#b76a17]",
                        )}
                      />
                      <p className="truncate text-[12px] font-semibold text-[#23242a]">{bucket.label}</p>
                    </div>
                    <span className="rounded-full bg-[#f4f6fa] px-2 py-0.5 text-[10px] text-[#6e7380]">{bucket.tasks.length}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-[10px] uppercase tracking-[0.14em] text-[#8b8d96]">{bucket.status}</p>
                    <span className="text-[10px] text-[#8b8d96]">{progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f1f3f8]">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        bucket.key === "all-sprints"
                          ? "bg-[#2160ff]"
                          : bucket.key === "no-sprint"
                            ? "bg-[#9aa1af]"
                            : bucket.status === "Active"
                              ? "bg-[#2f7d4f]"
                              : bucket.status === "Planning"
                                ? "bg-[#2160ff]"
                                : "bg-[#b76a17]",
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#7b7c85]">
                    <span>{done} done</span>
                    <span>{bucket.tasks.length - done} open</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 p-4 pb-28">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-[#23242a]">{activeGroup?.label || "Tasks"}</p>
              <p className="text-[13px] text-[#7b7c85]">
                {taskView === "open" ? "Only active work" : taskView === "done" ? "Completed work" : taskView === "overdue" ? "Overdue items" : "All tasks in this bucket"}
              </p>
            </div>
            <TabsShell
              value={taskView}
              onValueChange={setTaskView}
              tabs={[
                { value: "open", label: "Open" },
                { value: "all", label: "All" },
                { value: "done", label: "Done" },
                { value: "overdue", label: "Overdue" },
              ]}
            >
              <div />
            </TabsShell>
          </div>

          <div className="space-y-2">
            {visibleTasks.length ? (
              paginatedTasks.map((task) => {
                const project = projectLookup.get(task.projectId);
                return (
                  <div key={task.$id} className="grid min-w-0 gap-3 rounded-[18px] border border-[#ececf0] bg-white px-4 py-3 transition hover:border-[#dde2eb] hover:bg-[#fcfcfd] xl:grid-cols-[minmax(0,1fr)_220px]">
                    <button type="button" onClick={() => openTask(task.$id, "manage")} className="min-w-0 text-left">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="truncate text-[13px] font-semibold text-[#23242a]">{task.title}</p>
                        <span className="rounded-full bg-[#f4f6fa] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#7d818c]">
                          {project ? `${project.name} - ${task.taskNo || task.$id}` : task.taskNo || task.$id}
                        </span>
                      </div>
                    </button>

                    <div className="flex flex-nowrap items-center justify-start gap-1.5 xl:justify-end">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={`${task.$id}-${status}-preview`}
                          type="button"
                          onClick={() => status !== task.status && onStatusChange(task, status)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                            status === task.status
                              ? "border-[#2160ff] bg-[#eef4ff] text-[#2160ff]"
                              : "border-[#e3e5ec] bg-white text-[#6d7280] hover:border-[#cfd4df] hover:text-[#2b3240]",
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyStateWidget title="No tasks in this slice" body="Try another sprint bucket or switch the view filter to All." />
            )}

            {visibleTasks.length > TASKS_PER_PAGE ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#ececf0] bg-[#fbfbfc] px-4 py-3">
                <p className="text-[12px] text-[#7b7c85]">
                  Showing {(currentPage - 1) * TASKS_PER_PAGE + 1}-{Math.min(currentPage * TASKS_PER_PAGE, visibleTasks.length)} of {visibleTasks.length} tasks
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-[#e3e5ec] bg-white px-3 py-1.5 text-[11px] font-medium text-[#6d7280] transition hover:border-[#cfd4df] hover:text-[#2b3240] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {pageWindow.map((pageNumber) => (
                    <button
                      key={`manage-page-${pageNumber}`}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                        pageNumber === currentPage
                          ? "border-[#2160ff] bg-[#eef4ff] text-[#2160ff]"
                          : "border-[#e3e5ec] bg-white text-[#6d7280] hover:border-[#cfd4df] hover:text-[#2b3240]",
                      )}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-[#e3e5ec] bg-white px-3 py-1.5 text-[11px] font-medium text-[#6d7280] transition hover:border-[#cfd4df] hover:text-[#2b3240] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ManageWorkbenchConceptPreview({ tasks, sprints, projects, selectedProject, openTask = () => {}, onStatusChange = () => {} }) {
  const sprintLookup = useMemo(() => {
    const buckets = sprints.map((sprint) => ({
      key: sprint.$id,
      label: sprint.name,
      status: sprint.status,
      tasks: tasks.filter((task) => task.sprintId === sprint.$id),
    }));
    const noSprintTasks = tasks.filter((task) => !task.sprintId);
    return [
      {
        key: "all-sprints",
        label: "All Sprints",
        status: selectedProject ? selectedProject.name : "Cross Sprint",
        tasks,
      },
      ...buckets,
      {
        key: "no-sprint",
        label: "No Sprint",
        status: "Open Pool",
        tasks: noSprintTasks,
      },
    ].filter((bucket) => bucket.tasks.length > 0);
  }, [selectedProject, sprints, tasks]);

  const [activeBucket, setActiveBucket] = useState(() => sprintLookup[0]?.key || "all-sprints");
  const [taskView, setTaskView] = useState("open");

  useEffect(() => {
    if (!sprintLookup.find((bucket) => bucket.key === activeBucket)) {
      setActiveBucket(sprintLookup[0]?.key || "all-sprints");
    }
  }, [activeBucket, sprintLookup]);

  const activeGroup = sprintLookup.find((bucket) => bucket.key === activeBucket) || sprintLookup[0] || null;
  const visibleTasks = useMemo(() => {
    if (!activeGroup) return [];
    const scoped = activeGroup.tasks.slice().sort((left, right) => new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0));
    if (taskView === "all") return scoped;
    if (taskView === "done") return scoped.filter((task) => task.status === "Done");
    if (taskView === "overdue") return scoped.filter(isOverdueTask);
    return scoped.filter((task) => task.status !== "Done");
  }, [activeGroup, taskView]);

  const counts = useMemo(() => ({
    total: visibleTasks.length,
    open: visibleTasks.filter((task) => task.status !== "Done").length,
    done: visibleTasks.filter((task) => task.status === "Done").length,
    overdue: visibleTasks.filter(isOverdueTask).length,
  }), [visibleTasks]);

  const projectLookup = useMemo(() => new Map(projects.map((project) => [project.$id, project])), [projects]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-[#eadfd8] bg-[radial-gradient(circle_at_top_left,rgba(255,208,189,0.24),transparent_30%),linear-gradient(180deg,#fffdfb,#fbfcff)] p-0">
        <div className="border-b border-[#efe6e0] px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98919a]">Manage Study</p>
              <h3 className="mt-1 text-xl font-semibold text-[#23242a]">Operational sprint workspace</h3>
              <p className="mt-1 text-sm text-[#7b7c85]">A calmer list-based layout with faster sprint switching and clearer task scanning.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="border-[#ececf0] bg-white text-[#5f6169]">{selectedProject ? selectedProject.name : "All Projects"}</Badge>
              <Badge className="border-[#ececf0] bg-white text-[#5f6169]">{tasks.length} scoped tasks</Badge>
            </div>
          </div>
        </div>

        <div className="grid min-h-[720px] min-w-0 xl:grid-cols-[262px_minmax(0,1fr)]">
          <div className="border-r border-[#ececf0] bg-[linear-gradient(180deg,#fcfcfd,#f8f9fb)] p-3">
            <div className="mb-3 grid gap-2">
              <MiniMetric label="Visible" value={counts.total} />
              <div className="grid grid-cols-2 gap-2">
                <MiniMetric label="Open" value={counts.open} />
                <MiniMetric label="Overdue" value={counts.overdue} />
              </div>
            </div>
            <div className="space-y-2">
              {sprintLookup.map((bucket) => {
                const done = bucket.tasks.filter((task) => task.status === "Done").length;
                const progress = Math.round((done / Math.max(1, bucket.tasks.length)) * 100);
                const active = activeBucket === bucket.key;
                return (
                  <button
                    key={bucket.key}
                    type="button"
                    onClick={() => setActiveBucket(bucket.key)}
                    className={cn(
                      "w-full rounded-[18px] border px-3.5 py-3 text-left transition",
                      active
                        ? "border-[#d8dfea] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.05)]"
                        : "border-transparent bg-white/55 hover:border-[#e2e7f0] hover:bg-white",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-[#23242a]">{bucket.label}</p>
                        <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.14em] text-[#8b8d96]">{bucket.status}</p>
                      </div>
                      <span className="rounded-full bg-[#f5f6fa] px-2 py-0.5 text-[10px] text-[#6e7380]">{bucket.tasks.length}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eff2f7]">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          bucket.key === "all-sprints"
                            ? "bg-[#2160ff]"
                            : bucket.key === "no-sprint"
                              ? "bg-[#9aa1af]"
                              : bucket.status === "Active"
                                ? "bg-[#2f7d4f]"
                                : bucket.status === "Planning"
                                  ? "bg-[#2160ff]"
                                  : "bg-[#b76a17]",
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#7b7c85]">
                      <span>{done} complete</span>
                      <span>{progress}% flow</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 p-4">
            <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
              <div className="rounded-[22px] border border-[#ececf0] bg-white px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-[#23242a]">{activeGroup?.label || "Tasks"}</p>
                  <Badge className="border-[#ececf0] bg-[#fafafa] text-[#5f6169]">{counts.total} items</Badge>
                </div>
                <p className="mt-1 text-[13px] text-[#7b7c85]">
                  {taskView === "open" ? "Only active work in the selected sprint bucket." : taskView === "done" ? "Completed work grouped into the same operational lane." : taskView === "overdue" ? "Overdue tasks that need immediate attention." : "All tasks in the current sprint bucket."}
                </p>
              </div>
              <TabsShell
                value={taskView}
                onValueChange={setTaskView}
                tabs={[
                  { value: "open", label: "Open" },
                  { value: "all", label: "All" },
                  { value: "done", label: "Done" },
                  { value: "overdue", label: "Overdue" },
                ]}
              >
                <div />
              </TabsShell>
            </div>

            <div className="space-y-3">
              {visibleTasks.length ? (
                visibleTasks.slice(0, 12).map((task) => {
                  const project = projectLookup.get(task.projectId);
                  return (
                    <div
                      key={task.$id}
                      className="grid min-w-0 gap-3 rounded-[22px] border border-[#ececf0] bg-[linear-gradient(180deg,#ffffff,#fcfcfd)] px-4 py-3.5 transition hover:border-[#d9dfe9] hover:bg-white xl:grid-cols-[6px_minmax(0,1fr)_220px]"
                    >
                      <div
                        className={cn(
                          "rounded-full",
                          task.status === "Done"
                            ? "bg-[#2f7d4f]"
                            : task.status === "In Progress"
                              ? "bg-[#2160ff]"
                              : "bg-[#f15a24]",
                        )}
                      />
                      <button type="button" onClick={() => openTask(task.$id, "manage")} className="min-w-0 text-left">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="truncate text-[13px] font-semibold text-[#23242a]">{task.title}</p>
                          <span className="rounded-full bg-[#f4f6fa] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#7d818c]">
                            {project ? `${project.name} - ${task.taskNo || task.$id}` : task.taskNo || task.$id}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#7b7c85]">
                          <span>{task.status}</span>
                          <span className="text-[#d0d3db]">•</span>
                          <span>{task.priority || "Priority unset"}</span>
                          <span className="text-[#d0d3db]">•</span>
                          <span>{task.labels?.length ? task.labels.slice(0, 2).join(", ") : "No labels"}</span>
                        </div>
                      </button>
                      <div className="flex flex-nowrap items-center justify-start gap-1.5 xl:justify-end">
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={`${task.$id}-${status}-concept`}
                            type="button"
                            onClick={() => status !== task.status && onStatusChange(task, status)}
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                              status === task.status
                                ? "border-[#2160ff] bg-[#eef4ff] text-[#2160ff]"
                                : "border-[#e3e5ec] bg-white text-[#6d7280] hover:border-[#cfd4df] hover:text-[#2b3240]",
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyStateWidget title="No tasks in this slice" body="Try another sprint bucket or switch the view filter." />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
