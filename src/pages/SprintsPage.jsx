import { Plus } from "lucide-react";
import { Badge, Button, Card } from "../components/ui";
import { formatDate } from "../lib/utils";
import { EmptyStateWidget, MiniMetric, SprintBurndownCard } from "./shared";

export default function SprintsPage({
  sprints,
  tasks,
  activeSprint,
  projects,
  selectedProject,
  onCreateSprint,
  onEditSprint,
  onSprintStatusChange,
  onCommitTask,
  onUncommitTask,
  analytics,
}) {
  const backlogTasks = tasks.filter((task) => task.status !== "Done" && !task.sprintId && (!activeSprint || task.projectId === activeSprint.projectId));
  const activeSprintTasks = activeSprint ? tasks.filter((task) => (activeSprint.committedTaskIds || []).includes(task.$id)) : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#8f9098]">Sprint workspace</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#23242a]">
                {selectedProject ? `${selectedProject.name} sprint planning` : "Cross-project sprint planning"}
              </h2>
              <p className="mt-2 text-sm text-[#7b7c85]">Create, start, close, and track sprint commitments with rollover visibility.</p>
            </div>
            <Button variant="poster" className="w-auto rounded-full px-2 py-2 text-sm font-semibold whitespace-nowrap" onClick={onCreateSprint}>
              <Plus className="ml-4 h-4 w-4" />
              <span className="mr-4 text-sm">New Sprint</span>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MiniMetric label="Active Sprint" value={activeSprint?.name || "None"} />
            <MiniMetric label="Predictability" value={`${analytics.sprintPredictability}%`} />
            <MiniMetric label="Rollover Tasks" value={tasks.filter((task) => task.sprintId && task.status !== "Done").length} />
          </div>
        </Card>
        <SprintBurndownCard analytics={analytics} sprint={activeSprint} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-[#23242a]">Sprints</p>
            <p className="text-sm text-[#7b7c85]">Manage lifecycle and goals.</p>
          </div>
          <div className="space-y-3">
            {sprints.length ? (
              sprints.map((sprint) => {
                const sprintProject = projects.find((project) => project.$id === sprint.projectId);
                const committedCount = (sprint.committedTaskIds || []).length;
                const completedCount = tasks.filter((task) => (sprint.committedTaskIds || []).includes(task.$id) && task.status === "Done").length;
                return (
                  <Card key={sprint.$id} className="border border-[#ececf0] bg-[#fafafa] p-4">
                    <div className="flex items-start justify-between gap-3 ">
                      <div>
                        <p className="font-semibold text-[#23242a]">{sprint.name}</p>
                        <p className="mt-1 text-sm text-[#7b7c85]">{sprint.goal || "No sprint goal yet."}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#8f9098]">
                          {sprintProject?.name || "No project"} · {formatDate(sprint.startDate, "No start")} to {formatDate(sprint.endDate, "No end")}
                        </p>
                      </div>
                      <Badge className="border-[#ececf0] bg-white text-[#5f6169]">{sprint.status}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-[#62636b]">
                      <span>{completedCount}/{committedCount} completed</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => onEditSprint(sprint)}>
                          Edit
                        </Button>
                        {sprint.status === "Planning" ? (
                          <Button variant="outline" size="sm" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => onSprintStatusChange(sprint, "Active")}>
                            Start
                          </Button>
                        ) : null}
                        {sprint.status !== "Closed" ? (
                          <Button variant="outline" size="sm" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => onSprintStatusChange(sprint, "Closed")}>
                            Close
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <EmptyStateWidget title="No sprints yet" body="Create a sprint to start planning task commitments and burndown." />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-[#23242a]">Commit backlog to active sprint</p>
            <p className="text-sm text-[#7b7c85]">Assign unscheduled work into the current sprint.</p>
          </div>
          <div className="space-y-3">
            {activeSprint ? (
              backlogTasks.length ? (
                backlogTasks.slice(0, 10).map((task) => (
                  <div key={task.$id} className="flex items-center justify-between rounded-[16px] border border-[#ececf0] bg-[#fafafa] px-4 py-3">
                    <div>
                      <p className="font-medium text-[#23242a]">{task.title}</p>
                      <p className="text-sm text-[#7b7c85]">{task.priority} · {task.status}</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => onCommitTask(task, activeSprint.$id)}>
                      Commit
                    </Button>
                  </div>
                ))
              ) : (
                <EmptyStateWidget title="No backlog candidates" body="All visible tasks are either completed or already linked to a sprint." />
              )
            ) : (
              <EmptyStateWidget title="No active sprint" body="Start a sprint first to commit tasks and track predictability." />
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#23242a]">Active sprint scope</p>
            <p className="text-sm text-[#7b7c85]">Manage tasks already committed to the current sprint.</p>
          </div>
          {activeSprint ? <Badge className="border-[#ececf0] bg-[#f5f5f7] text-[#62636b]">{activeSprint.name}</Badge> : null}
        </div>
        <div className="space-y-3">
          {activeSprint ? (
            activeSprintTasks.length ? (
              activeSprintTasks.map((task) => (
                <div key={task.$id} className="flex items-center justify-between rounded-[16px] border border-[#ececf0] bg-[#fafafa] px-4 py-3">
                  <div>
                    <p className="font-medium text-[#23242a]">{task.title}</p>
                    <p className="text-sm text-[#7b7c85]">{task.status} · {task.priority}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => onUncommitTask(task, activeSprint.$id)}>
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <EmptyStateWidget title="No committed tasks yet" body="Commit backlog items into the active sprint to manage them here." />
            )
          ) : (
            <EmptyStateWidget title="No active sprint" body="Start or edit a sprint to manage committed work." />
          )}
        </div>
      </Card>
    </div>
  );
}
