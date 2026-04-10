import { Plus, Copy } from "lucide-react";
import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../lib/utils";

const STATUS_OPTIONS = ["Backlog", "In Progress", "Done"];
const PROJECT_COLORS = ["#f15a24", "#df9e00", "#b219cb"];

export default function TaskBoardPage({
  themeMode,
  tasks,
  doneColumnTasks,
  openTask,
  onDuplicateTask,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  sensors,
  projects,
  activeDragTaskId,
}) {
  const columns = {
    Backlog: tasks.filter((task) => task.status === "Backlog"),
    "In Progress": tasks.filter((task) => task.status === "In Progress"),
    Done: doneColumnTasks,
  };
  const activeDragTask = tasks.find((task) => task.$id === activeDragTaskId) || null;

  return (
    <div className="space-y-5">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
        <div className="grid gap-4 xl:grid-cols-3">
          {STATUS_OPTIONS.map((status, index) => (
            <BoardColumn
              key={status}
              status={status}
              color={PROJECT_COLORS[index]}
              tasks={columns[status]}
              openTask={openTask}
              onDuplicateTask={onDuplicateTask}
              projects={projects}
              themeMode={themeMode}
            />
          ))}
        </div>
        <DragOverlay>
          {activeDragTask ? (
            <div className="rotate-1 opacity-95">
              <TaskBoardPreviewCard task={activeDragTask} project={projects.find((project) => project.$id === activeDragTask.projectId)} themeMode={themeMode} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function BoardColumn({ status, tasks, openTask, onDuplicateTask, color, projects, themeMode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "taskboard-column rounded-[24px] p-3 transition-colors duration-150",
        themeMode === "dark" ? "border border-[#3a4048] bg-[#303030]" : "border border-[#e6e7eb] bg-[#f7f7f8]",
        isOver && (themeMode === "dark" ? "border-[#5a6472] bg-[#383838]" : "border-[#b9caff] bg-[#f2f6ff]"),
      )}
    >
      <div className="mb-3 flex items-center justify-between rounded-2xl px-4 py-3 text-white" style={{ backgroundColor: color }}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{status}</p>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{tasks.length}</span>
        </div>
        <Plus className="h-4 w-4" />
      </div>
      <SortableContext items={tasks.map((task) => task.$id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[300px] space-y-3">
          {tasks.map((task) => (
            <BoardCard key={task.$id} task={task} openTask={openTask} onDuplicateTask={onDuplicateTask} project={projects.find((project) => project.$id === task.projectId)} themeMode={themeMode} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function BoardCard({ task, openTask, onDuplicateTask, project, themeMode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.$id, data: { status: task.status } });
  const style = { transform: CSS.Transform.toString(transform), transition: transition || "transform 180ms ease, opacity 180ms ease" };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardShell task={task} project={project} onClick={() => openTask(task.$id, "taskboard")} onDuplicateTask={onDuplicateTask} themeMode={themeMode} />
    </div>
  );
}

function TaskBoardPreviewCard({ task, project, themeMode }) {
  return <TaskCardShell task={task} project={project} overlay themeMode={themeMode} />;
}

function TaskCardShell({ task, project, onClick, onDuplicateTask, overlay = false, themeMode = "light" }) {
  const palette =
    themeMode === "dark"
      ? {
          glow: "none",
          frame: "linear-gradient(180deg, rgba(64,64,64,0.98), rgba(56,56,56,0.98))",
          tint: "none",
          pillBg:
            task.status === "Done"
              ? "rgba(111, 230, 182, 0.14)"
              : task.status === "In Progress"
                ? "rgba(87, 150, 255, 0.14)"
                : "rgba(255, 176, 92, 0.14)",
          pillText:
            task.status === "Done"
              ? "#8fe2bf"
              : task.status === "In Progress"
                ? "#9abaff"
                : "#ffc189",
          priorityBg: "rgba(255,255,255,0.10)",
          text: "#eef2f7",
          muted: "#a2adbb",
          chipBg: "rgba(255,255,255,0.08)",
          duplicateHover: "rgba(255,255,255,0.08)",
          border: "rgba(90, 97, 108, 0.9)",
          overlay: "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
        }
      : task.status === "Done"
      ? {
          glow: "radial-gradient(circle at 18% 18%, rgba(131, 214, 255, 0.24), transparent 34%), radial-gradient(circle at 84% 12%, rgba(255, 140, 173, 0.22), transparent 30%), radial-gradient(circle at 76% 76%, rgba(200, 192, 255, 0.18), transparent 30%)",
          frame: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(249,255,252,0.92))",
          tint: "linear-gradient(135deg, rgba(111, 230, 182, 0.1), rgba(111, 230, 182, 0.02))",
          pillBg: "rgba(111, 230, 182, 0.16)",
          pillText: "#248a63",
          priorityBg: "rgba(255,255,255,0.62)",
          text: "#24304a",
          muted: "#6d7891",
          chipBg: "rgba(255,255,255,0.55)",
          duplicateHover: "rgba(255,255,255,0.60)",
          border: "rgba(255,255,255,0.60)",
          overlay: "linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.42))",
        }
      : task.status === "In Progress"
        ? {
            glow: "radial-gradient(circle at 24% 12%, rgba(114, 201, 255, 0.31), transparent 34%), radial-gradient(circle at 70% 30%, rgba(84, 138, 255, 0.2), transparent 34%), radial-gradient(circle at 82% 88%, rgba(249, 201, 230, 0.15), transparent 28%)",
            frame: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,248,255,0.96))",
            tint: "linear-gradient(135deg, rgba(87, 150, 255, 0.1), rgba(87, 150, 255, 0.02))",
            pillBg: "rgba(87, 150, 255, 0.14)",
            pillText: "#2d6fe8",
            priorityBg: "rgba(255,255,255,0.62)",
            text: "#20314d",
            muted: "#64748d",
            chipBg: "rgba(255,255,255,0.55)",
            duplicateHover: "rgba(255,255,255,0.60)",
            border: "rgba(255,255,255,0.60)",
            overlay: "linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.42))",
          }
        : {
            glow: "radial-gradient(circle at 14% 22%, rgba(255, 156, 139, 0.25), transparent 28%), radial-gradient(circle at 48% 36%, rgba(255, 185, 221, 0.31), transparent 32%), radial-gradient(circle at 90% 78%, rgba(146, 146, 255, 0.19), transparent 32%)",
            frame: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,250,244,0.96))",
            tint: "linear-gradient(135deg, rgba(255, 176, 92, 0.1), rgba(255, 176, 92, 0.02))",
            pillBg: "rgba(255, 176, 92, 0.16)",
            pillText: "#b96a18",
            priorityBg: "rgba(255,255,255,0.62)",
            text: "#342741",
            muted: "#756777",
            chipBg: "rgba(255,255,255,0.55)",
            duplicateHover: "rgba(255,255,255,0.60)",
            border: "rgba(255,255,255,0.60)",
            overlay: "linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.42))",
          };

  return (
    <div
      className={cn("taskboard-card group relative cursor-grab overflow-hidden rounded-[26px] border p-4 shadow-[0_18px_40px_rgba(148,163,184,0.16)] transition duration-150 hover:-translate-y-0.5", overlay && "border-[#b9caff]")}
      style={{ background: palette.frame, borderColor: palette.border }}
      onClick={onClick}
    >
      <div className="absolute inset-0" style={{ background: palette.glow }} />
      <div className="absolute inset-0" style={{ background: palette.tint }} />
      <div className="absolute inset-0" style={{ background: palette.overlay }} />
      <div className="relative z-10">
        <div className="flex items-start items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: palette.muted }}>
              {project?.name || "No project"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!overlay && onDuplicateTask ? (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDuplicateTask(task);
                }}
                className={cn("rounded-full p-2 transition", themeMode === "dark" ? "hover:bg-white/10" : "hover:bg-white/60")}
                title="Duplicate task"
              >
                <Copy className="h-3.5 w-3.5" style={{ color: palette.text }} />
              </button>
            ) : null}
            <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ backgroundColor: palette.priorityBg, color: palette.text }}>
              {task.priority}
            </span>
          </div>
        </div>
        <div>
          <p className="mt-2 text-s font-semibold leading-tight" style={{ color: palette.text }}>
            {task.title}
          </p>
        </div>
        <p className="mt-1 line-clamp-2 text-sm" style={{ color: palette.muted }}>
          {task.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(task.labels || []).slice(0, 2).map((label) => (
              <span key={label} className="rounded-full px-3 py-1 text-[11px] font-medium" style={{ backgroundColor: palette.chipBg, color: palette.text }}>
                {label}
              </span>
            ))}
          </div>
          <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ backgroundColor: palette.pillBg, color: palette.pillText }}>
            {task.status}
          </span>
        </div>
      </div>
    </div>
  );
}
