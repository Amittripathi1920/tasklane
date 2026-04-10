import { useEffect, useState } from "react";
import { LoaderCircle, Send, Sparkles } from "lucide-react";
import { Badge, Button, Card, TabsShell, Textarea } from "../components/ui";
import { cn } from "../lib/utils";
import { MiniMetric } from "./shared";

export default function AiZonePage({
  scriptMode,
  setScriptMode,
  scriptOutput,
  scriptLoading,
  onGenerateScript,
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage,
  selectedProject,
}) {
  const [tab, setTab] = useState(scriptMode === "weekly" ? "weekly" : "dsm");

  useEffect(() => {
    setScriptMode(tab === "weekly" ? "weekly" : "dsm");
  }, [tab, setScriptMode]);

  return (
    <Card className="border border-[#e8e8ec] bg-white p-6">
      <div className="mb-4" />
      <TabsShell
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: "dsm", label: "DSM Script" },
          { value: "weekly", label: "Weekly Meeting Script" },
          { value: "chat", label: "Script Enhancer" },
        ]}
      >
        {tab !== "chat" ? (
          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4 rounded-[28px] border border-[#ececf0] bg-[#fafafa] p-5">
              <div>
                <p className="text-lg font-semibold text-[#23242a]">{tab === "dsm" ? "Daily standup generator" : "Weekly meeting generator"}</p>
                <p className="mt-2 text-sm leading-6 text-[#7b7c85]">
                  DNI-labeled tasks are excluded before the AI payload is sent. Related comments and subtasks are included automatically in the prompt context.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <MiniMetric label="Mode" value={tab === "dsm" ? "Daily DSM" : "Weekly Sync"} />
                <MiniMetric label="Scope" value={selectedProject ? selectedProject.name : "All Projects"} />
              </div>
              <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onGenerateScript} disabled={scriptLoading}>
                {scriptLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate {tab === "dsm" ? "DSM" : "Weekly"} Script
              </Button>
            </div>
            <div className="rounded-[28px] border border-[#ececf0] bg-[#fafafa] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#23242a]">Generated script</p>
                  <p className="text-sm text-[#7b7c85]">Meeting-ready output with no preamble.</p>
                </div>
                <Badge className="border-[#dfe7ff] bg-[#eef4ff] text-[#2160ff]">{tab === "dsm" ? "DSM" : "Weekly"}</Badge>
              </div>
              <Textarea readOnly value={scriptOutput} placeholder="Generate a script to preview the output here." className="min-h-[420px] border-[#e5e5e9] bg-white text-[#1f1f1f] placeholder:text-[#8f9098]" />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <div className="rounded-[28px] border border-[#ececf0] bg-[#fafafa] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#23242a]">Script enhancer chat</p>
                  <p className="text-sm text-[#7b7c85]">Refine tone, structure, and readability.</p>
                </div>
                <Badge className="border-[#ececf0] bg-white text-[#5f6169]">Session</Badge>
              </div>
              <div className="max-h-[480px] space-y-3 overflow-auto pr-1">
                {chatMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      "max-w-[85%] rounded-[24px] px-4 py-3 text-sm leading-6",
                      message.role === "assistant" ? "border border-[#e6e7eb] bg-white text-[#23242a]" : "ml-auto bg-[#2160ff] text-white",
                    )}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 xl:w-[340px]">
              <div className="rounded-[28px] border border-[#ececf0] bg-[#fafafa] p-4">
                <p className="text-sm font-semibold text-[#23242a]">Prompt</p>
                <p className="mt-1 text-sm text-[#7b7c85]">Ask for executive tone, concise bullets, blocker emphasis, or meeting-ready cleanup.</p>
              </div>
              <Textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask the AI to tighten the script, make it executive, or convert it into bullets."
                className="min-h-[220px] border-[#e5e5e9] bg-white text-[#1f1f1f] placeholder:text-[#8f9098]"
              />
              <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={sendChatMessage}>
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        )}
      </TabsShell>
    </Card>
  );
}
