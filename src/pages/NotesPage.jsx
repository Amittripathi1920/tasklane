import { Bold, Heading1, Heading2, Italic, List, LoaderCircle, Plus, Save, Trash2, Underline, Users } from "lucide-react";
import { Badge, Button, Card, Field, Input, SelectField } from "../components/ui";
import { formatDateTime } from "../lib/utils";
import { EmptyStateWidget } from "./shared";
import { useEffect, useMemo, useRef, useState } from "react";

function ToolbarButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5e5e9] bg-white text-[#545862] transition hover:bg-[#f7f8fb]"
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const next = value || "";
    if (editorRef.current.innerHTML !== next) {
      editorRef.current.innerHTML = next;
    }
  }, [value]);

  function syncContent() {
    onChange(editorRef.current?.innerHTML || "");
  }

  function exec(command, commandValue = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncContent();
  }

  return (
    <div className="rounded-[22px] border border-[#e5e5e9] bg-[#fafafa]">
      <div className="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-[#ececf0] bg-white/92 px-3 py-3 backdrop-blur-sm">
        <ToolbarButton icon={Heading1} label="Heading 1" onClick={() => exec("formatBlock", "h1")} />
        <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => exec("formatBlock", "h2")} />
        <ToolbarButton icon={Bold} label="Bold" onClick={() => exec("bold")} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => exec("italic")} />
        <ToolbarButton icon={Underline} label="Underline" onClick={() => exec("underline")} />
        <ToolbarButton icon={List} label="Bullet List" onClick={() => exec("insertUnorderedList")} />
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncContent}
        className="min-h-[520px] px-4 py-4 text-[14px] leading-7 text-[#1f1f1f] outline-none [&_h1]:mt-2 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:my-2 empty:before:text-[#9aa0ab] empty:before:content-[attr(data-placeholder)]"
        data-placeholder={placeholder}
      />
    </div>
  );
}

export default function NotesPage({
  scope,
  setScope,
  personalNotes,
  projectNotes,
  selectedNoteId,
  setSelectedNoteId,
  selectedProject,
  projects,
  onCreatePersonalNote,
  onCreateProjectNote,
  onSaveNote,
  onDeleteNote,
  saving,
}) {
  const [draft, setDraft] = useState({ title: "", content: "", projectId: "" });

  const notes = scope === "personal" ? personalNotes : projectNotes;
  const selectedNote = useMemo(
    () => notes.find((note) => note.$id === selectedNoteId) || notes[0] || null,
    [notes, selectedNoteId],
  );

  useEffect(() => {
    if (!selectedNote) {
      setDraft({
        title: "",
        content: "",
        projectId: selectedProject?.$id || projects[0]?.$id || "",
      });
      return;
    }
    setDraft({
      title: selectedNote.title || "",
      content: selectedNote.content || "",
      projectId: selectedNote.projectId || selectedProject?.$id || projects[0]?.$id || "",
    });
  }, [selectedNote, selectedProject, projects]);

  function createNote() {
    if (scope === "project") {
      onCreateProjectNote(selectedProject?.$id || projects[0]?.$id || "");
      return;
    }
    onCreatePersonalNote();
  }

  async function saveSelected() {
    if (!selectedNote) {
      createNote();
      return;
    }
    await onSaveNote(selectedNote, draft);
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-[#ececf0] bg-[linear-gradient(180deg,#fffdfb,#fbfcff)] p-0">
        {/* <div className="border-b border-[#ececf0] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(250,251,255,0.92))] px-5 py-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f9098]">Notes Workspace</p>
              <h2 className="mt-1 text-xl font-semibold text-[#23242a]">{scope === "project" ? "Project note editor" : "Personal note editor"}</h2>
              <p className="mt-1 text-sm text-[#7b7c85]">
                {selectedNote
                  ? `Editing ${selectedNote.title || "Untitled note"}`
                  : "Choose a note from the sidebar or create a fresh one."}
              </p>
            </div>
            {scope === "project" && selectedProject ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Badge className="border-[#ececf0] bg-white text-[#5f6169]">
                  <Users className="mr-2 h-3.5 w-3.5" />
                  {selectedProject.name}
                </Badge>
              </div>
            ) : null}
          </div>
        </div> */}

        <div className="p-4">
              <div className="space-y-4">
                {/* <div className="rounded-[22px] border border-[#ececf0] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#23242a]">Editor</p>
                      <p className="text-sm text-[#7b7c85]">
                        Last updated {formatDateTime(selectedNote.updatedAt)} by {selectedNote.userName || "workspace member"}.
                      </p>
                    </div>
                  </div>
                </div> */}

                {scope === "project" ? (
                  <div className="grid gap-3 lg:grid-cols-3 lg:items-end">
                    <Field label="Title">
                      <Input
                        className="h-12 border-[#e5e5e9] bg-white text-[#1f1f1f] text-[15px]"
                        value={draft.title}
                        onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Untitled note"
                      />
                    </Field>
                      <Field label="Project">
                        <SelectField
                          value={draft.projectId}
                          onValueChange={(value) => setDraft((current) => ({ ...current, projectId: value }))}
                          options={projects.map((project) => ({ value: project.$id, label: project.name }))}
                          placeholder="Select project"
                        />
                      </Field>
                      <Field label="Actions">
                        <div className="grid h-12 grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            className="h-12 rounded-[14px] border border-[#dfe3ea] bg-white/72 px-3 text-xs text-[#4f5562] shadow-none backdrop-blur-sm hover:border-[#cfd6e2] hover:bg-white hover:text-[#23242a] hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                            onClick={createNote}
                            type="button"
                          >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            New
                          </Button>
                          <Button
                            variant="outline"
                            className="h-12 rounded-[14px] border border-[#ecd4d4] bg-white/72 px-3 text-xs text-[#9b5b5b] shadow-none backdrop-blur-sm hover:border-[#e4c0c0] hover:bg-[#fff7f7] hover:text-[#8f3939] hover:shadow-[0_8px_20px_rgba(180,67,67,0.06)]"
                            onClick={() => selectedNote && onDeleteNote(selectedNote)}
                            disabled={!selectedNote}
                            type="button"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            className="h-12 rounded-[14px] border border-[#dfe3ea] bg-white/72 px-3 text-xs text-[#4f5562] shadow-none backdrop-blur-sm hover:border-[#cfd6e2] hover:bg-white hover:text-[#23242a] hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                            onClick={saveSelected}
                            disabled={saving || !selectedNote}
                            type="button"
                          >
                            {saving ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                            Save
                          </Button>
                        </div>
                      </Field>
                  </div>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2 lg:items-end">
                    <Field label="Title">
                      <Input
                        className="h-12 border-[#e5e5e9] bg-white text-[#1f1f1f] text-[15px]"
                        value={draft.title}
                        onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Untitled note"
                      />
                    </Field>
                    <Field label="Actions">
                      <div className="grid h-12 grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          className="h-12 rounded-[14px] border border-[#dfe3ea] bg-white/72 px-3 text-xs text-[#4f5562] shadow-none backdrop-blur-sm hover:border-[#cfd6e2] hover:bg-white hover:text-[#23242a] hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                          onClick={createNote}
                          type="button"
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          New
                        </Button>
                        <Button
                          variant="outline"
                          className="h-12 rounded-[14px] border border-[#ecd4d4] bg-white/72 px-3 text-xs text-[#9b5b5b] shadow-none backdrop-blur-sm hover:border-[#e4c0c0] hover:bg-[#fff7f7] hover:text-[#8f3939] hover:shadow-[0_8px_20px_rgba(180,67,67,0.06)]"
                          onClick={() => selectedNote && onDeleteNote(selectedNote)}
                          disabled={!selectedNote}
                          type="button"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          className="h-12 rounded-[14px] border border-[#dfe3ea] bg-white/72 px-3 text-xs text-[#4f5562] shadow-none backdrop-blur-sm hover:border-[#cfd6e2] hover:bg-white hover:text-[#23242a] hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                          onClick={saveSelected}
                          disabled={saving || !selectedNote}
                          type="button"
                        >
                          {saving ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                          Save
                        </Button>
                      </div>
                    </Field>
                  </div>
                )}

                <Field
                  label="Content"
                  hint={
                    selectedNote
                      ? `Last updated ${formatDateTime(selectedNote.updatedAt)} by ${selectedNote.userName || "workspace member"}.`
                      : scope === "project"
                        ? "Create a new project note to start writing for this workspace."
                        : "Create a new personal note to start writing."
                  }
                >
                  <div className="rounded-[24px] border border-[#ececf0] bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                    <RichTextEditor
                      value={draft.content}
                      onChange={(value) => setDraft((current) => ({ ...current, content: value }))}
                      placeholder="Write notes, decisions, meeting captures, or working drafts here."
                    />
                  </div>
                </Field>
              </div>
        </div>
      </Card>
    </div>
  );
}
