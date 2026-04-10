import { LoaderCircle, Send } from "lucide-react";
import { Badge, Button, Card, Field, Input, SelectField, Textarea } from "../components/ui";
import { formatDateTime } from "../lib/utils";
import { EmptyStateWidget } from "./shared";

const FEEDBACK_TYPE_OPTIONS = ["Feedback", "Request", "Bug", "Idea"];

export default function FeedbackPage({ feedbackForm, setFeedbackForm, onSubmit, saving, entries }) {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-[#ececf0] bg-[linear-gradient(135deg,#fff7f2,#fff,#f4f6fb)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f9098]">Feedback Desk</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#23242a]">Share feedback or raise a request</h2>
            </div>
            <Badge className="border-[#ececf0] bg-white text-[#5f6169]">{entries.length} submissions</Badge>
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <Field label="Type">
                <SelectField value={feedbackForm.type} onValueChange={(value) => setFeedbackForm((current) => ({ ...current, type: value }))} options={FEEDBACK_TYPE_OPTIONS} />
              </Field>
              <Field label="Title">
                <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" value={feedbackForm.title} onChange={(event) => setFeedbackForm((current) => ({ ...current, title: event.target.value }))} placeholder="Short summary" />
              </Field>
            </div>
            <Field label="Details" hint="Describe the problem, request, or idea clearly.">
              <Textarea
                className="min-h-[220px] border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]"
                value={feedbackForm.message}
                onChange={(event) => setFeedbackForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Tell us what is happening, what you expect, and why it matters."
              />
            </Field>
            <div className="flex justify-end">
              <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onSubmit} disabled={saving}>
                {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit {feedbackForm.type}
              </Button>
            </div>
          </div>

          <Card className="p-5">
            <p className="text-sm font-semibold text-[#23242a]">Your submissions</p>
            <div className="mt-4 space-y-3">
              {entries.length ? (
                entries.map((entry) => (
                  <div key={entry.$id} className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#23242a]">{entry.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8f9098]">{entry.type}</p>
                      </div>
                      <Badge className="border-[#ececf0] bg-white text-[#5f6169]">{entry.status || "New"}</Badge>
                    </div>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#6f7280]">{entry.message}</p>
                    <p className="mt-3 text-xs text-[#8f9098]">Submitted {formatDateTime(entry.createdAt)}</p>
                  </div>
                ))
              ) : (
                <EmptyStateWidget title="No submissions yet" body="Use the form to send feedback or raise a request from your account." />
              )}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}
