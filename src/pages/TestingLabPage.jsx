import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Gauge,
  Layers3,
  Target,
} from "lucide-react";
import { Badge } from "../components/ui";
import { cn, formatDate } from "../lib/utils";

const MIX_COLORS = ["#ece5d9", "#bcae97", "#8e7e66", "#62584c", "#3f474d"];

function panelClass(extra = "") {
  return cn(
    "relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(67,73,80,0.9),rgba(28,31,36,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.30)]",
    extra,
  );
}

function GridSkin() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-16"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_24%)]" />
    </>
  );
}

function MetricOrb({ icon: Icon, label, value, note }) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/14 bg-[linear-gradient(180deg,rgba(23,28,33,0.76),rgba(43,49,56,0.96))] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/48">{label}</p>
        <p className="mt-1 text-[24px] font-light leading-none text-white">{value}</p>
        <p className="mt-1 text-[11px] text-white/62">{note}</p>
      </div>
    </div>
  );
}

function ProjectScopeCard({ projects }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {projects.map((project, index) => (
        <div key={project.$id} className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-2">
          <div className="flex min-h-[124px] h-full flex-col justify-between rounded-[18px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_34%),linear-gradient(180deg,rgba(255,248,240,0.78),rgba(182,165,145,0.30))] p-3 text-[#3d352d]">
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-full bg-white/76 px-2.5 py-1 text-[10px] font-medium">{project.name}</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-medium">{index === 0 ? "Primary scope" : "Available scope"}</p>
              <p className="mt-1 text-[11px] text-[#544a40]">Project-level view ready for quick switching.</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MixMiniCard({ title, data }) {
  const filtered = data.filter((item) => item.count > 0);
  return (
    <div className={panelClass("p-0")}>
      <GridSkin />
      <div className="relative p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[17px] font-light tracking-[-0.02em] text-white">{title}</p>
            <p className="mt-1 text-sm text-white/62">Current scope distribution</p>
          </div>
          <Badge className="border-white/10 bg-white/8 text-white/74">{filtered.reduce((sum, item) => sum + item.count, 0)}</Badge>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[150px_minmax(0,1fr)] lg:items-center">
          <div className="h-[132px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={filtered} dataKey="count" nameKey="label" innerRadius={34} outerRadius={56} paddingAngle={4}>
                  {filtered.map((entry, index) => (
                    <Cell key={entry.label} fill={MIX_COLORS[index % MIX_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(18,20,24,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {filtered.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between rounded-[14px] border border-white/8 bg-white/5 px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm text-white/82">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MIX_COLORS[index % MIX_COLORS.length] }} />
                  <span>{item.label}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TinyMetricCard({ value, label }) {
  return (
    <div className={panelClass("min-h-[150px]")}>
      <GridSkin />
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[30px] font-light leading-none text-white">{value}</span>
          <div className="rounded-full border border-white/14 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/64">Live</div>
        </div>
        <div>
          <p className="text-[12px] font-medium text-white/90">{label}</p>
          <p className="mt-1 text-[11px] text-white/60">Updated for the current scope</p>
        </div>
      </div>
    </div>
  );
}

export default function TestingLabPage({ analytics, greeting, activeSprint, selectedProject, projects, currentUser, openTask }) {
  const scopedProjects = useMemo(() => {
    if (selectedProject) return [selectedProject, ...projects.filter((project) => project.$id !== selectedProject.$id).slice(0, 3)];
    return projects.slice(0, 4);
  }, [projects, selectedProject]);

  const productivitySeries = analytics.productivity.week;
  const latestDeadlines = analytics.deadlineLane.slice(0, 3);
  const scopeName = selectedProject ? selectedProject.name : "All Projects";

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[34px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,#121518,#0b0d0f)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/42">Testing Lab</p>
            <h2 className="mt-2 text-[26px] font-light tracking-[-0.03em] text-white">Dashboard redesign study using our live execution data</h2>
            <p className="mt-2 text-sm text-white/68">
              {greeting} {currentUser?.name ? `, ${currentUser.name}` : ""}. This version reuses our dashboard signals, but presents them in a darker premium control-surface style inspired by your reference.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-white/10 bg-white/8 text-white/80">{scopeName}</Badge>
            <Badge className="border-white/10 bg-white/8 text-white/80">{activeSprint?.name || "No Active Sprint"}</Badge>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <section className={panelClass("xl:col-span-3 xl:row-span-2")}>
            <GridSkin />
            <div className="relative flex h-full min-h-[430px] flex-col justify-between p-5">
              <div className="mx-auto mt-2 w-[78%] max-w-[252px] rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,18,22,0.94),rgba(36,41,47,0.88))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="mx-auto h-6 w-24 rounded-full bg-black/55" />
                <div className="mt-4 rounded-[24px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,239,221,0.52),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))] p-5">
                  <div className="mx-auto h-28 w-16 rounded-[999px] border border-white/28 bg-[linear-gradient(180deg,rgba(255,245,237,0.55),rgba(178,163,147,0.18))] shadow-[inset_0_0_40px_rgba(255,255,255,0.14)]" />
                  <div className="mt-5 rounded-[18px] border border-white/10 bg-black/18 px-3 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/48">Project health</p>
                    <p className="mt-2 text-[36px] font-light text-white">{analytics.projectHealth.score}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-[18px] font-light tracking-[-0.02em] text-white">Execution Command Surface</h3>
                <p className="mt-3 max-w-[280px] text-sm leading-6 text-white/68">
                  Keep project health, completion, and delivery pressure visible in one calm surface instead of spreading those signals across separate widgets.
                </p>
              </div>
            </div>
          </section>

          <section className={panelClass("xl:col-span-3")}>
            <GridSkin />
            <div className="relative flex h-full min-h-[214px] flex-col justify-between p-5">
              <div>
                <h3 className="max-w-[200px] text-[18px] font-light leading-tight tracking-[-0.03em] text-white">Core execution signals</h3>
                <p className="mt-3 max-w-[260px] text-sm leading-6 text-white/68">
                  These are the four controls that shape the health of the current delivery window.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricOrb icon={Target} label="Completion" value={`${analytics.completionRate}%`} note="Tasks closed in scope" />
                <MetricOrb icon={Clock3} label="Cycle" value={`${analytics.avgCycleTime}d`} note="Average cycle time" />
                <MetricOrb icon={Bot} label="AI usage" value={analytics.aiUsageCount} note="Assisted actions" />
                <MetricOrb icon={Gauge} label="Overdue" value={analytics.overdue} note="Requires attention" />
              </div>
            </div>
          </section>

          <section className={panelClass("xl:col-span-6")}>
            <GridSkin />
            <div className="relative flex h-full min-h-[214px] flex-col justify-between p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div>
                  <h3 className="max-w-[240px] text-[18px] font-light leading-tight tracking-[-0.03em] text-white">Project scope and room to compare</h3>
                  <p className="mt-3 max-w-[340px] text-sm leading-6 text-white/68">
                    Swap between projects without leaving the dashboard and keep the current scope visually anchored in the same surface.
                  </p>
                </div>
                <ProjectScopeCard projects={scopedProjects} />
              </div>
            </div>
          </section>

          <section className={panelClass("xl:col-span-6")}>
            <GridSkin />
            <div className="relative flex h-full min-h-[236px] flex-col justify-between p-5">
              <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <h3 className="text-[18px] font-light leading-tight tracking-[-0.03em] text-white">Weekly output control</h3>
                  <p className="mt-3 text-sm leading-6 text-white/68">
                    Created versus completed work over the last five weeks, tuned to the current project scope.
                  </p>
                </div>
                <div className="min-w-0">
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={productivitySeries} margin={{ top: 6, right: 0, left: -24, bottom: 0 }}>
                        <defs>
                          <linearGradient id="testing-lab-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#efe7da" stopOpacity={0.48} />
                            <stop offset="100%" stopColor="#efe7da" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "rgba(18,20,24,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }} />
                        <Area type="monotone" dataKey="count" stroke="#f0ebe4" strokeWidth={2.4} fill="url(#testing-lab-area)" />
                        <Area type="monotone" dataKey="createdCount" stroke="#9a8b74" strokeWidth={2} fill="none" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={panelClass("xl:col-span-3")}>
            <GridSkin />
            <div className="relative flex h-full min-h-[236px] flex-col justify-between p-5">
              <div>
                <p className="text-[12px] font-medium text-white/74">Active sprint pulse</p>
                <h3 className="mt-3 text-[18px] font-light leading-tight tracking-[-0.03em] text-white">{activeSprint?.name || "No active sprint"}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/66">Predictability</span>
                  <span className="text-[34px] font-light text-white">{analytics.sprintPredictability}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[18px] border border-white/10 bg-white/6 p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/46">Throughput</p>
                    <p className="mt-2 text-[22px] font-light text-white">{analytics.throughput7d}</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/6 p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/46">Open subtasks</p>
                    <p className="mt-2 text-[22px] font-light text-white">{analytics.openSubtasks}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={panelClass("xl:col-span-3")}>
            <GridSkin />
            <div className="relative flex h-full min-h-[236px] flex-col justify-between p-5">
              <div>
                <h3 className="max-w-[220px] text-[18px] font-light leading-tight tracking-[-0.03em] text-white">Visible scope chips</h3>
                <p className="mt-3 text-sm leading-6 text-white/68">
                  Keep project context close without turning the page into a filter-heavy control bar.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {scopedProjects.slice(0, 5).map((project, index) => (
                  <span key={project.$id} className={cn("rounded-full border border-white/10 px-3 py-2 text-[12px]", index === 0 ? "bg-white/14 text-white/90" : "bg-[#8d7d68]/20 text-[#f2ebdf]")}>
                    {project.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className={panelClass("xl:col-span-4")}>
            <GridSkin />
            <div className="relative grid h-full min-h-[210px] gap-4 p-5 lg:grid-cols-[210px_minmax(0,1fr)] lg:items-center">
              <div>
                <h3 className="text-[18px] font-light tracking-[-0.03em] text-white">Completion dial</h3>
                <p className="mt-3 text-sm leading-6 text-white/68">
                  A single calm read of how much work is actually getting closed in the selected scope.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative flex h-[176px] w-[176px] items-center justify-center rounded-full border border-white/28 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),rgba(255,255,255,0.04))]">
                  <div className="absolute inset-[18px] rounded-full border border-white/10" />
                  <div className="text-center text-white">
                    <p className="text-[40px] font-light leading-none">{analytics.completionRate}%</p>
                    <p className="mt-2 text-sm text-white/66">completion</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={panelClass("xl:col-span-4 p-0")}>
            <GridSkin />
            <div className="relative p-5">
              <div className="mb-4">
                <h3 className="text-[18px] font-light tracking-[-0.03em] text-white">Status distribution</h3>
                <p className="mt-2 text-sm text-white/68">Real task mix from the current scope.</p>
              </div>
              <MixMiniCard title="Status mix" data={analytics.statusMix} />
            </div>
          </section>

          <section className={panelClass("xl:col-span-4 p-0")}>
            <GridSkin />
            <div className="relative p-5">
              <div className="mb-4">
                <h3 className="text-[18px] font-light tracking-[-0.03em] text-white">Priority pressure</h3>
                <p className="mt-2 text-sm text-white/68">Shows where urgency is concentrated right now.</p>
              </div>
              <MixMiniCard title="Priority mix" data={analytics.priorityMix} />
            </div>
          </section>

          <section className={panelClass("xl:col-span-4")}>
            <GridSkin />
            <div className="relative flex h-full min-h-[210px] flex-col justify-between p-5">
              <div>
                <h3 className="text-[18px] font-light tracking-[-0.03em] text-white">Upcoming deadlines</h3>
                <p className="mt-3 text-sm leading-6 text-white/68">Deadline lane converted into a compact task stack.</p>
              </div>
              <div className="space-y-2.5">
                {latestDeadlines.length ? latestDeadlines.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openTask(item.id)}
                    className="flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/6 px-3 py-2.5 text-left transition hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-white/88">{item.title}</p>
                      <p className="mt-1 text-[11px] text-white/60">{item.projectName}</p>
                    </div>
                    <p className="text-[11px] text-white/72">{formatDate(item.dueDate, "No due")}</p>
                  </button>
                )) : <p className="text-sm text-white/58">No deadlines in the current scope.</p>}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:col-span-4 xl:grid-cols-2">
            <TinyMetricCard value={`${analytics.projectHealth.score}`} label="Health Score" />
            <TinyMetricCard value={`${analytics.avgCycleTime}d`} label="Cycle Time" />
            <TinyMetricCard value={`${analytics.aiUsageCount}`} label="AI Usage" />
            <TinyMetricCard value={`${analytics.overdueRate}%`} label="Overdue Rate" />
          </section>
        </div>
      </div>
    </div>
  );
}
