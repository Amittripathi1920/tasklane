import { ArrowUpRight, CheckCircle2, Clock3, Gauge, Sparkles, Target } from "lucide-react";
import { Badge, Button, Card } from "../components/ui";
import {
  AssigneeCapacityCard,
  AnalyticsPanel,
  CumulativeFlowCard,
  DeadlineLaneCard,
  DeliveryTimeReviewCard,
  HeatmapCard,
  HealthBadge,
  InsightSnapshotCard,
  MixCard,
  PersonalFocusDistributionCard,
  ProjectCardList,
  RiskRadarCard,
  SparkKpiCard,
  SprintStrategyRailCard,
  SprintBurndownCard,
} from "./shared";

export default function DashboardPage({
  greeting,
  analytics,
  tasks,
  openTask,
  selectedProject,
  projects,
  activeProjectId,
  onOpenStandupDigest,
  activeSprint,
  currentUser,
}) {
  const scopedProjects = activeProjectId === "all" ? projects : projects.filter((project) => project.$id === activeProjectId);

  return (
    <div className="min-w-0 space-y-4">
      <section>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8f9098]">{greeting}</p>
              <h2 className="mt-1 text-[30px] font-semibold leading-tight text-[#23242a]">
                {selectedProject ? `${selectedProject.name} command center` : "Project execution overview"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <HealthBadge status={analytics.projectHealth.status} score={analytics.projectHealth.score} />
              <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onOpenStandupDigest}>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Standup Digest
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SparkKpiCard icon={Target} label="Completion Rate" value={`${analytics.completionRate}%`} series={analytics.kpiSparklines.throughput} />
            <SparkKpiCard icon={CheckCircle2} label="Throughput (7d)" value={analytics.throughput7d} tone="emerald" series={analytics.kpiSparklines.throughput} />
            <SparkKpiCard icon={Clock3} label="Avg Cycle Time" value={`${analytics.avgCycleTime}d`} tone="sky" series={analytics.kpiSparklines.created} />
            <SparkKpiCard icon={Gauge} label="Health Score" value={analytics.projectHealth.score} tone="amber" series={analytics.kpiSparklines.throughput} />
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <AnalyticsPanel analytics={analytics} />
        </div>
        <div className="space-y-4 xl:col-span-4">
          <RiskRadarCard analytics={analytics} />
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#23242a]">Latest focus items</p>
                <p className="text-sm text-[#7b7c85]">Most recently updated tasks</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-[#2160ff]" />
            </div>
            <div className="mt-4 space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <button
                  key={task.$id}
                  onClick={() => openTask(task.$id)}
                  className="w-full rounded-[16px] border border-[#ececf0] bg-[#fafafa] p-3 text-left transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[#23242a]">{task.title}</p>
                    <Badge className="border-[#e1e6ff] bg-[#edf2ff] text-[#2160ff]">{task.status}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[#7b7c85]">{task.description}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <MixCard title="Status Mix" data={analytics.statusMix} />
        </div>
        <div className="xl:col-span-4">
          <MixCard title="Priority Mix" data={analytics.priorityMix} />
        </div>
        <div className="xl:col-span-4">
          <ProjectCardList projects={scopedProjects} allTasks={tasks} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <AssigneeCapacityCard analytics={analytics} />
        </div>
        <div className="xl:col-span-5">
          <DeliveryTimeReviewCard analytics={analytics} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <SprintStrategyRailCard analytics={analytics} />
        </div>
        <div className="xl:col-span-5">
          <PersonalFocusDistributionCard analytics={analytics} currentUser={currentUser} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <CumulativeFlowCard analytics={analytics} />
        </div>
        <div className="xl:col-span-6">
          <SprintBurndownCard analytics={analytics} sprint={activeSprint} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <HeatmapCard analytics={analytics} />
        </div>
        <div className="space-y-4 xl:col-span-7">
          <DeadlineLaneCard analytics={analytics} openTask={openTask} />
          <InsightSnapshotCard analytics={analytics} />
        </div>
      </section>
    </div>
  );
}
