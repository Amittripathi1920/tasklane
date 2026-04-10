import { useState } from "react";
import { Badge, Card, TabsShell } from "../components/ui";
import { relativeTime, sortTasks } from "../lib/utils";
import { AuditTimeline } from "./shared";

export default function ActivityPage({ tasks, comments, openTask, auditEntries }) {
  const [tab, setTab] = useState("activity");
  const rows = sortTasks(tasks).map((task) => ({
    ...task,
    commentCount: comments.filter((comment) => comment.taskId === task.$id).length,
  }));

  return (
    <Card className="border border-[#e8e8ec] bg-white p-6">
      <div className="mt-5">
        <TabsShell
          value={tab}
          onValueChange={setTab}
          tabs={[
            { value: "activity", label: "Activity" },
            { value: "audit", label: "Global Audit Timeline" },
          ]}
        >
          <div />
        </TabsShell>
      </div>

      {tab === "activity" ? (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[#8f9098]">
              <tr>
                <th className="pb-3">Task</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Updated</th>
                <th className="pb-3">Comments</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((task) => (
                <tr key={task.$id} onClick={() => openTask(task.$id, "activity")} className="cursor-pointer border-t border-[#efeff2] transition hover:bg-[#fafafa]">
                  <td className="py-4">
                    <p className="font-semibold text-[#23242a]">{task.title}</p>
                    <p className="mt-1 line-clamp-2 max-w-md text-[#7b7c85]">{task.description}</p>
                  </td>
                  <td className="py-4">
                    <Badge className="border-[#e1e6ff] bg-[#edf2ff] text-[#2160ff]">{task.status}</Badge>
                  </td>
                  <td className="py-4">
                    <Badge className="border-[#ececf0] bg-[#f3f4f6] text-[#5f6169]">{task.priority}</Badge>
                  </td>
                  <td className="py-4 text-[#62636b]">{relativeTime(task.updatedAt)}</td>
                  <td className="py-4 text-[#62636b]">{task.commentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5">
          <AuditTimeline entries={auditEntries.slice(0, 24)} title="Global audit timeline" />
        </div>
      )}
    </Card>
  );
}
