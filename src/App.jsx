import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Columns3,
  Copy,
  Database,
  Globe,
  Code2,
  Monitor,
  Palette,
  PenTool,
  Megaphone,
  ShoppingBag,
  Shield,
  Wrench,
  Bug,
  BarChart3,
  BookOpen,
  Lightbulb,
  PencilLine,
  Cpu,
  FileText,
  FolderOpen,
  Gauge,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  MessageSquare,
  Minimize2,
  Moon,
  Mars,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Settings2,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Venus,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  createAuditEntry,
  createComment,
  createFeedbackEntry,
  createNote,
  createProject,
  createProjectMember,
  createSprint,
  createSubtask,
  createTask,
  fetchAuditEntries,
  fetchComments,
  fetchFeedbackEntries,
  fetchNotes,
  fetchProjectMembers,
  fetchProjects,
  fetchSprints,
  fetchSubtasks,
  fetchTasks,
  missingConfig,
  runAiAction,
  runAuthAction,
  updateComment,
  updateNote,
  updateProjectMember,
  updateProject,
  updateSprint,
  updateSubtask,
  updateTask,
  uploadCommentImage,
} from "./lib/appwrite";
import { getGreeting, kolkataNow } from "./lib/time";
import {
  cn,
  formatDate,
  formatDateTime,
  formatMinutes,
  getLatestTaskNo,
  getTaskActualMinutes,
  getTaskEstimateMinutes,
  hoursToMinutes,
  includesLabel,
  isOverdueTask,
  isWithinDateRange,
  minutesToHoursValue,
  numberOrZero,
  relativeTime,
  sortTasks,
} from "./lib/utils";
import {
  Badge,
  Button,
  Card,
  CheckboxRow,
  DialogShell,
  Field,
  Input,
  ScrollPanel,
  SelectField,
  TabsShell,
  Textarea,
} from "./components/ui";
import DashboardPageView from "./pages/DashboardPage";
import TaskBoardPageView from "./pages/TaskBoardPage";
import ActivityPageView from "./pages/ActivityPage";
import SprintsPageView from "./pages/SprintsPage";
import ManagePageView from "./pages/ManagePage";
import AiZonePageView from "./pages/AiZonePage";
import ProfilePageView from "./pages/ProfilePage";
import FeedbackPageView from "./pages/FeedbackPage";
import TestingLabPageView from "./pages/TestingLabPage";
import NotesPageView from "./pages/NotesPage";
import { AuditTimeline, ButtonStudyGroup, EmptyStateWidget, MiniMetric } from "./pages/shared";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "taskboard", label: "TaskBoard", icon: Columns3 },
  { id: "sprints", label: "Sprints", icon: Rocket },
  { id: "activity", label: "Activity", icon: Clock3 },
  { id: "manage", label: "Manage", icon: Settings2 },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "aizone", label: "AI Zone", icon: Bot },
  { id: "testing", label: "Testing Lab", icon: Sparkles },
];

const STATUS_OPTIONS = ["Backlog", "In Progress", "Done"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
const DEFAULT_LABELS = ["DNI", "Frontend", "Backend", "Ops", "Design", "Bug", "Release"];
const PROJECT_COLORS = ["#f15a24", "#df9e00", "#b219cb", "#2f8f2f", "#2160ff", "#d94f70"];
const PROJECT_ICON_OPTIONS = [
  { value: "FolderOpen", label: "Folder", icon: FolderOpen },
  { value: "LayoutDashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "Rocket", label: "Rocket", icon: Rocket },
  { value: "Code2", label: "Code", icon: Code2 },
  { value: "Database", label: "Database", icon: Database },
  { value: "Monitor", label: "Monitor", icon: Monitor },
  { value: "Palette", label: "Palette", icon: Palette },
  { value: "PenTool", label: "Pen Tool", icon: PenTool },
  { value: "Megaphone", label: "Marketing", icon: Megaphone },
  { value: "ShoppingBag", label: "Commerce", icon: ShoppingBag },
  { value: "Shield", label: "Security", icon: Shield },
  { value: "Wrench", label: "Operations", icon: Wrench },
  // { value: "Bug", label: "Bugfix", icon: Bug },
  // { value: "BarChart3", label: "Analytics", icon: BarChart3 },
  // { value: "BookOpen", label: "Documentation", icon: BookOpen },
  { value: "Lightbulb", label: "Ideas", icon: Lightbulb },
  { value: "Globe", label: "Web", icon: Globe },
  { value: "Cpu", label: "Platform", icon: Cpu },
];
const PROJECT_MEMBER_ROLE_OPTIONS = ["Owner", "Manager", "Member", "Viewer"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];

const INITIAL_FORM = {
  projectId: "",
  sprintId: "",
  assignedToUserId: "",
  assignedToName: "",
  title: "",
  description: "",
  status: "Backlog",
  priority: "Medium",
  dueDate: "",
  estimateHours: 4,
  actualHours: "",
  labels: ["DNI"],
  recurringEnabled: false,
  recurringFrequency: "weekly",
  recurringInterval: 1,
};

const SPRINT_STATUS_OPTIONS = ["Planning", "Active", "Closed"];
const RECURRING_OPTIONS = ["daily", "weekly", "monthly"];
const FEEDBACK_TYPE_OPTIONS = ["Feedback", "Request", "Bug", "Idea"];
const FEEDBACK_STATUS_OPTIONS = ["New", "Under Review", "Planned", "Closed"];
const CHART_COLORS = ["#2160ff", "#71e6b6", "#f15a24", "#b219cb", "#df9e00"];
const AUTH_SESSION_STORAGE_KEY = "tasklane_auth_session";
const PROFILE_AVATAR_URL =
  "https://plus.unsplash.com/premium_photo-1739376473691-cdc1db244ac6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function getProjectIconComponent(iconName) {
  return PROJECT_ICON_OPTIONS.find((option) => option.value === iconName)?.icon || FolderOpen;
}

function safeDate(value) {
  if (!value) return null;
  try {
    return parseISO(value);
  } catch {
    return null;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getSessionToken() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.token || "";
  } catch {
    return "";
  }
}

function canManageProjectRole(role) {
  return role === "Owner" || role === "Manager";
}

function normalizeGender(value) {
  const gender = String(value || "").trim();
  if (gender === "Female") return "Female";
  if (gender === "Other") return "Other";
  return "Male";
}

function GenderIcon({ gender, className = "h-4 w-4" }) {
  const normalized = normalizeGender(gender);
  if (normalized === "Female") return <Venus className={className} />;
  if (normalized === "Other") return <Users className={className} />;
  return <Mars className={className} />;
}

function sparklineFromCounts(items, key = "count") {
  return items.map((item, index) => ({ index, value: item[key] || 0 }));
}

function computeProjectHealth(tasks) {
  if (!tasks.length) {
    return { status: "On Track", score: 100, overdueRate: 0, throughput: 0, wip: 0 };
  }

  const overdue = tasks.filter(isOverdueTask).length;
  const wip = tasks.filter((task) => task.status === "In Progress").length;
  const done = tasks.filter((task) => task.status === "Done").length;
  const completionRate = done / tasks.length;
  const overdueRate = overdue / tasks.length;
  const wipRate = wip / tasks.length;
  const throughput = tasks.filter((task) => {
    const completedAt = safeDate(task.completedAt);
    return completedAt && completedAt >= subDays(new Date(), 7);
  }).length;

  const score = clamp(
    Math.round(100 - overdueRate * 45 - wipRate * 20 + completionRate * 35 + Math.min(throughput, 7) * 2),
    18,
    100,
  );

  let status = "On Track";
  if (score < 45 || overdueRate > 0.35) status = "Delayed";
  else if (score < 70 || overdueRate > 0.15 || wipRate > 0.45) status = "At Risk";

  return { status, score, overdueRate, throughput, wip };
}

function getNextRecurringDate(task) {
  const baseDate = safeDate(task.lastRecurringAt) || safeDate(task.createdAt) || new Date();
  const interval = Math.max(1, Number(task.recurringInterval) || 1);
  if (task.recurringFrequency === "daily") return addDays(baseDate, interval);
  if (task.recurringFrequency === "monthly") return addMonths(baseDate, interval);
  return addWeeks(baseDate, interval);
}

function buildTimelineSeries(tasks, mode = "due") {
  return tasks
    .filter((task) => (mode === "due" ? task.dueDate : task.createdAt))
    .map((task) => ({
      id: task.$id,
      title: task.title,
      date: mode === "due" ? task.dueDate : task.createdAt,
      status: task.status,
      priority: task.priority,
    }))
    .sort((a, b) => Date.parse(a.date || 0) - Date.parse(b.date || 0))
    .slice(0, 8);
}

function getTaskLifecycleDays(task, startKey, endKey) {
  const start = safeDate(task[startKey]);
  const end = safeDate(task[endKey]);
  if (!start || !end) return null;
  return Math.max(0, differenceInCalendarDays(end, start));
}

function getAuditMeta(entry) {
  if (!entry?.meta) return null;
  try {
    return JSON.parse(entry.meta);
  } catch {
    return null;
  }
}

export default function App() {
  const [page, setPage] = useState("taskboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("tasklane_theme_mode");
    return stored === "dark" ? "dark" : "light";
  });
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [notes, setNotes] = useState([]);
  const [comments, setComments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("edit");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Script enhancer is ready. Ask for rewrites, tone changes, or summaries." },
  ]);
  const [scriptMode, setScriptMode] = useState("dsm");
  const [scriptOutput, setScriptOutput] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectDialogMode, setProjectDialogMode] = useState("create");
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectAccessOpen, setProjectAccessOpen] = useState(false);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [sprintDialogMode, setSprintDialogMode] = useState("create");
  const [editingSprintId, setEditingSprintId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    color: PROJECT_COLORS[0],
    icon: PROJECT_ICON_OPTIONS[0].value,
  });
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [memberInviteForm, setMemberInviteForm] = useState({ email: "", role: "Member" });
  const [sprintForm, setSprintForm] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    projectId: "",
    status: "Planning",
  });
  const [activeDragTaskId, setActiveDragTaskId] = useState(null);
  const [activeDragOriginStatus, setActiveDragOriginStatus] = useState("");
  const [imageViewer, setImageViewer] = useState({ open: false, url: "", zoom: 1, x: 0, y: 0 });
  const [standupDigest, setStandupDigest] = useState("");
  const [standupLoading, setStandupLoading] = useState(false);
  const [standupModalOpen, setStandupModalOpen] = useState(false);
  const [standupMinimized, setStandupMinimized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [profileForm, setProfileForm] = useState({ name: "", email: "", gender: "Male" });
  const [feedbackForm, setFeedbackForm] = useState({ type: "Feedback", title: "", message: "" });
  const [notesScope, setNotesScope] = useState("personal");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [quickActionSelected, setQuickActionSelected] = useState("create");
  const [quickActionHovered, setQuickActionHovered] = useState(null);

  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const pointerState = useRef({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const actorName = currentUser?.name || currentUser?.email || "Tasklane User";
  const actorUserId = currentUser?.$id || "";

  useEffect(() => {
    window.localStorage.setItem("tasklane_theme_mode", themeMode);
    document.body.classList.toggle("theme-dark", themeMode === "dark");
    document.body.classList.toggle("theme-light", themeMode !== "dark");
  }, [themeMode]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.$id === selectedTaskId) || null,
    [selectedTaskId, tasks],
  );
  const activeProjectMembers = useMemo(
    () => projectMembers.filter((member) => member.isActive !== false),
    [projectMembers],
  );
  const myProjectMemberships = useMemo(
    () => activeProjectMembers.filter((member) => member.userId === currentUser?.$id),
    [activeProjectMembers, currentUser],
  );
  const accessibleProjectIds = useMemo(() => {
    if (currentUser?.role === "Admin") {
      return new Set(projects.filter((project) => project.isActive !== false).map((project) => project.$id));
    }
    return new Set(myProjectMemberships.map((member) => member.projectId));
  }, [currentUser, myProjectMemberships, projects]);
  const activeProjects = useMemo(
    () =>
      projects.filter(
        (project) => project.isActive !== false && (currentUser?.role === "Admin" || accessibleProjectIds.has(project.$id)),
      ),
    [accessibleProjectIds, currentUser, projects],
  );
  const assigneeOptions = useMemo(() => {
    const base = [
      { value: "all", label: "All users tasks" },
      { value: "me", label: "My assigned tasks" },
    ];
    const people = directoryUsers.map((user) => ({
      value: user.$id,
      label: user.$id === currentUser?.$id ? `${user.name || user.email} (Me)` : user.name || user.email,
    }));
    return [...base, ...people];
  }, [currentUser, directoryUsers]);
  const activeSprints = useMemo(
    () => sprints.filter((sprint) => sprint.status !== "Closed"),
    [sprints],
  );
  const selectedProject = useMemo(
    () =>
      activeProjectId === "all"
        ? null
        : activeProjects.find((project) => project.$id === activeProjectId) || null,
    [activeProjectId, activeProjects],
  );
  const filteredTasks = useMemo(() => {
    const scopedTasks =
      activeProjectId === "all"
        ? tasks.filter(
            (task) =>
              task.isActive !== false &&
              (!task.projectId || currentUser?.role === "Admin" || accessibleProjectIds.has(task.projectId)),
          )
        : tasks.filter((task) => task.projectId === activeProjectId && task.isActive !== false);
    const assigneeScopedTasks =
      assigneeFilter === "all"
        ? scopedTasks
        : assigneeFilter === "me"
          ? scopedTasks.filter((task) => task.assignedToUserId === currentUser?.$id)
          : scopedTasks.filter((task) => task.assignedToUserId === assigneeFilter);
    return sortTasks(assigneeScopedTasks);
  }, [accessibleProjectIds, activeProjectId, assigneeFilter, currentUser, tasks]);
  const activeComments = useMemo(
    () => comments.filter((comment) => comment.isActive !== false),
    [comments],
  );
  const activeSubtasks = useMemo(
    () => subtasks.filter((subtask) => subtask.isActive !== false),
    [subtasks],
  );
  const myFeedbackEntries = useMemo(
    () =>
      sortTasks(
        feedbackEntries.filter(
          (entry) =>
            entry.isActive !== false &&
            (currentUser?.role === "Admin" ? true : entry.userId === currentUser?.$id),
        ),
      ),
    [currentUser, feedbackEntries],
  );
  const activeNotes = useMemo(
    () =>
      notes
        .filter((note) => note.isActive !== false)
        .map((note) => ({
          ...note,
          projectName: projects.find((project) => project.$id === note.projectId)?.name || "",
        })),
    [notes, projects],
  );
  const personalNotes = useMemo(
    () =>
      activeNotes
        .filter((note) => note.type === "personal" && note.userId === currentUser?.$id)
        .sort((a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0)),
    [activeNotes, currentUser],
  );
  const projectNotes = useMemo(
    () =>
      activeNotes
        .filter(
          (note) =>
            note.type === "project" &&
            note.projectId &&
            (currentUser?.role === "Admin" || accessibleProjectIds.has(note.projectId)) &&
            (activeProjectId === "all" || note.projectId === activeProjectId),
        )
        .sort((a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0)),
    [activeNotes, accessibleProjectIds, activeProjectId, currentUser],
  );
  const filteredSprints = useMemo(
    () =>
      sortTasks(
        activeProjectId === "all"
          ? sprints.filter(
              (sprint) => currentUser?.role === "Admin" || accessibleProjectIds.has(sprint.projectId),
            )
          : sprints.filter((sprint) => sprint.projectId === activeProjectId),
      ),
    [accessibleProjectIds, activeProjectId, currentUser, sprints],
  );
  const selectedProjectRole = useMemo(() => {
    if (!selectedProject) return currentUser?.role === "Admin" ? "Owner" : "";
    if (currentUser?.role === "Admin") return "Owner";
    return myProjectMemberships.find((member) => member.projectId === selectedProject.$id)?.role || "";
  }, [currentUser, myProjectMemberships, selectedProject]);
  const selectedProjectMembers = useMemo(
    () =>
      selectedProject
        ? activeProjectMembers.filter((member) => member.projectId === selectedProject.$id)
        : [],
    [activeProjectMembers, selectedProject],
  );
  const canManageSelectedProject = useMemo(
    () => currentUser?.role === "Admin" || canManageProjectRole(selectedProjectRole),
    [currentUser, selectedProjectRole],
  );
  const activeSprint = useMemo(
    () => filteredSprints.find((sprint) => sprint.status === "Active") || filteredSprints[0] || null,
    [filteredSprints],
  );
  const editingSprint = useMemo(
    () => sprints.find((sprint) => sprint.$id === editingSprintId) || null,
    [editingSprintId, sprints],
  );
  const currentNotes = notesScope === "project" ? projectNotes : personalNotes;

  const taskComments = (taskId) =>
    activeComments
      .filter((comment) => comment.taskId === taskId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const taskSubtasks = (taskId) =>
    activeSubtasks
      .filter((subtask) => subtask.taskId === taskId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  useEffect(() => {
    if (missingConfig.length > 0) {
      setLoading(false);
      setAuthLoading(false);
      setError(`Missing required environment variables: ${missingConfig.join(", ")}`);
      return;
    }
    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (page !== "notes") return;
    if (!currentNotes.length) {
      if (selectedNoteId) setSelectedNoteId(null);
      return;
    }
    if (!selectedNoteId || !currentNotes.some((note) => note.$id === selectedNoteId)) {
      setSelectedNoteId(currentNotes[0].$id);
    }
  }, [currentNotes, page, selectedNoteId]);

  useEffect(() => {
    if (missingConfig.length > 0 || authLoading) return;
    if (!currentUser) {
      setLoading(false);
      setTasks([]);
      setProjects([]);
      setProjectMembers([]);
      setSprints([]);
      setAuditEntries([]);
      setFeedbackEntries([]);
      setNotes([]);
      setComments([]);
      setSubtasks([]);
      return;
    }
    loadAll();
  }, [authLoading, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setProfileForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      gender: normalizeGender(currentUser.gender),
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || directoryUsers.length > 0 || directoryLoading) return;
    loadUserDirectory();
  }, [currentUser, directoryUsers.length, directoryLoading]);

  useEffect(() => {
    function closeDropdowns(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", closeDropdowns);
    return () => document.removeEventListener("mousedown", closeDropdowns);
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const [taskDocs, projectDocs, projectMemberDocs, sprintDocs, auditDocs, feedbackDocs, noteDocs, commentDocs, subtaskDocs] =
        await Promise.all([
          fetchTasks(),
          fetchProjects(),
          fetchProjectMembers(),
          fetchSprints(),
          fetchAuditEntries(),
          fetchFeedbackEntries(),
          fetchNotes(),
          fetchComments(),
          fetchSubtasks(),
        ]);
      setTasks(sortTasks(taskDocs));
      setProjects(projectDocs);
      setProjectMembers(projectMemberDocs);
      setSprints(sprintDocs);
      setAuditEntries(auditDocs);
      setFeedbackEntries(feedbackDocs);
      setNotes(noteDocs);
      setComments(commentDocs);
      setSubtasks(subtaskDocs);
      const allowedProjectIds =
        currentUser?.role === "Admin"
          ? new Set(projectDocs.filter((project) => project.isActive !== false).map((project) => project.$id))
          : new Set(
              projectMemberDocs
                .filter((member) => member.isActive !== false && member.userId === currentUser?.$id)
                .map((member) => member.projectId),
            );
      if (activeProjectId !== "all" && !allowedProjectIds.has(activeProjectId)) {
        setActiveProjectId("all");
      }
    } catch (err) {
      setError(err.message || "Failed to load data from Appwrite.");
    } finally {
      setLoading(false);
    }
  }

  async function bootstrapAuth() {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (!raw) {
        setAuthLoading(false);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!parsed?.token) {
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        setAuthLoading(false);
        return;
      }
      const result = await runAuthAction({ action: "validate", token: parsed.token });
      setCurrentUser(result.user || null);
    } catch {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  function persistSession(result) {
    if (!result?.token) return;
    localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({ token: result.token, expiresAt: result.expiresAt }),
    );
    setCurrentUser(result.user || null);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    try {
      setAuthSubmitting(true);
      setError("");
      const payload =
        authMode === "signup"
          ? {
              action: "signup",
              name: authForm.name.trim(),
              email: authForm.email.trim(),
              password: authForm.password,
            }
          : {
              action: "login",
              email: authForm.email.trim(),
              password: authForm.password,
            };
      const result = await runAuthAction(payload);
      persistSession(result);
      setAuthForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.token) {
        await runAuthAction({ action: "logout", token: parsed.token });
      }
    } catch {
      // Ignore logout failures and clear local state anyway.
    } finally {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      setCurrentUser(null);
      setDirectoryUsers([]);
      setPage("dashboard");
      setEditorOpen(false);
      setStandupModalOpen(false);
      setStandupMinimized(false);
    }
  }

  async function loadUserDirectory() {
    try {
      setDirectoryLoading(true);
      const token = getSessionToken();
      if (!token) return;
      const result = await runAuthAction({ action: "directory", token });
      setDirectoryUsers(result.users || []);
    } catch (err) {
      setError(err.message || "Failed to load workspace users.");
    } finally {
      setDirectoryLoading(false);
    }
  }

  function openProjectAccessDialog() {
    setProjectAccessOpen(true);
    if (directoryUsers.length === 0 && !directoryLoading) {
      loadUserDirectory();
    }
  }

  function openCreateProjectDialog() {
    setProjectDialogMode("create");
    setEditingProjectId(null);
    setProjectForm({
      name: "",
      description: "",
      color: PROJECT_COLORS[0],
      icon: PROJECT_ICON_OPTIONS[0].value,
    });
    setProjectDialogOpen(true);
  }

  function openEditProjectDialog(project) {
    if (!project) return;
    setProjectDialogMode("edit");
    setEditingProjectId(project.$id);
    setProjectForm({
      name: project.name || "",
      description: project.description || "",
      color: project.color || PROJECT_COLORS[0],
      icon: project.icon || PROJECT_ICON_OPTIONS[0].value,
    });
    setProjectDialogOpen(true);
  }

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setError("");
      const token = getSessionToken();
      if (!token) throw new Error("Session missing. Please sign in again.");
      const result = await runAuthAction({
        action: "update_profile",
        token,
        name: profileForm.name.trim(),
        gender: normalizeGender(profileForm.gender),
      });
      setCurrentUser(result.user || null);
      setProfileForm({
        name: result.user?.name || "",
        email: result.user?.email || "",
        gender: normalizeGender(result.user?.gender),
      });
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitFeedback() {
    if (!feedbackForm.title.trim() || !feedbackForm.message.trim()) return;
    try {
      setSaving(true);
      setError("");
      const now = new Date().toISOString();
      await createFeedbackEntry({
        userId: actorUserId,
        userName: actorName,
        userEmail: currentUser?.email || "",
        type: feedbackForm.type,
        title: feedbackForm.title.trim(),
        message: feedbackForm.message.trim(),
        status: FEEDBACK_STATUS_OPTIONS[0],
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
      });
      await logAudit({
        entityType: "feedback",
        actionType: "feedback_created",
        message: `${feedbackForm.type} submitted: ${feedbackForm.title.trim()}.`,
      });
      setFeedbackForm({ type: "Feedback", title: "", message: "" });
      await loadAll();
      setPage("feedback");
    } catch (err) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreatePersonalNote() {
    try {
      setSaving(true);
      setError("");
      const now = new Date().toISOString();
      const created = await createNote({
        type: "personal",
        title: "Untitled note",
        content: "",
        userId: actorUserId,
        userName: actorName,
        projectId: "",
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
      });
      setNotesScope("personal");
      setPage("notes");
      setSelectedNoteId(created.$id);
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to create note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateProjectNote(projectId) {
    if (!projectId) {
      setError("Select a project first to create a project note.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const now = new Date().toISOString();
      const created = await createNote({
        type: "project",
        title: "Untitled project note",
        content: "",
        userId: actorUserId,
        userName: actorName,
        projectId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
      });
      setNotesScope("project");
      setPage("notes");
      setSelectedNoteId(created.$id);
      await loadAll();
      if (activeProjectId === "all") {
        setActiveProjectId(projectId);
      }
    } catch (err) {
      setError(err.message || "Failed to create note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNote(note, draft) {
    if (!note) return;
    if (!draft.title.trim()) {
      setError("Note title is required.");
      return;
    }
    if (note.type === "project" && !draft.projectId) {
      setError("Project notes must belong to a project.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await updateNote(note.$id, {
        title: draft.title.trim(),
        content: draft.content,
        projectId: note.type === "project" ? draft.projectId || "" : "",
        updatedAt: new Date().toISOString(),
        updatedByUserId: actorUserId,
        userName: actorName,
      });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(note) {
    if (!note) return;
    try {
      setSaving(true);
      setError("");
      await updateNote(note.$id, {
        isActive: false,
        updatedAt: new Date().toISOString(),
        updatedByUserId: actorUserId,
      });
      const remaining = currentNotes.filter((entry) => entry.$id !== note.$id);
      setSelectedNoteId(remaining[0]?.$id || null);
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to delete note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveProject() {
    if (!projectForm.name.trim()) return;
    try {
      setSaving(true);
      const now = new Date().toISOString();
      let targetProjectId = editingProjectId;
      if (projectDialogMode === "edit" && editingProjectId) {
        await updateProject(editingProjectId, {
          name: projectForm.name.trim(),
          description: projectForm.description.trim(),
          color: projectForm.color,
          icon: projectForm.icon,
          updatedAt: now,
          updatedByUserId: actorUserId,
        });
        await logAudit({
          projectId: editingProjectId,
          entityType: "project",
          actionType: "project_updated",
          message: `${projectForm.name.trim()} was updated.`,
        });
      } else {
        const created = await createProject({
          name: projectForm.name.trim(),
          description: projectForm.description.trim(),
          color: projectForm.color,
          icon: projectForm.icon,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdByUserId: actorUserId,
          updatedByUserId: actorUserId,
        });
        targetProjectId = created.$id;
        await createProjectMember({
          projectId: created.$id,
          userId: currentUser.$id,
          role: "Owner",
          addedBy: actorName,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        await logAudit({
          projectId: created.$id,
          entityType: "project",
          actionType: "project_created",
          message: `${projectForm.name.trim()} was created.`,
        });
      }
      await loadAll();
      setProjectDialogOpen(false);
      setProjectDialogMode("create");
      setEditingProjectId(null);
      setProjectForm({ name: "", description: "", color: PROJECT_COLORS[0], icon: PROJECT_ICON_OPTIONS[0].value });
      if (targetProjectId) setActiveProjectId(targetProjectId);
      setPage("taskboard");
    } catch (err) {
      setError(err.message || `Failed to ${projectDialogMode === "edit" ? "update" : "create"} project.`);
    } finally {
      setSaving(false);
    }
  }

  async function handleInviteProjectMember() {
    if (!selectedProject || !memberInviteForm.email.trim()) return;
    try {
      setSaving(true);
      setError("");
      const lookupEmail = memberInviteForm.email.trim().toLowerCase();
      const user = directoryUsers.find((entry) => entry.email?.toLowerCase() === lookupEmail);
      if (!user) {
        throw new Error("User not found. Ask them to sign up first, then add them to the project.");
      }
      const existingMember = activeProjectMembers.find(
        (member) => member.projectId === selectedProject.$id && member.userId === user.$id,
      );
      const now = new Date().toISOString();
      if (existingMember) {
        await updateProjectMember(existingMember.$id, {
          role: memberInviteForm.role,
          isActive: true,
          addedBy: actorName,
          updatedAt: now,
        });
      } else {
        await createProjectMember({
          projectId: selectedProject.$id,
          userId: user.$id,
          role: memberInviteForm.role,
          addedBy: actorName,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }
      await logAudit({
        projectId: selectedProject.$id,
        entityType: "project_member",
        actionType: "project_member_added",
        message: `${user.name || user.email} was added to ${selectedProject.name} as ${memberInviteForm.role}.`,
      });
      setMemberInviteForm({ email: "", role: "Member" });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to add project member.");
    } finally {
      setSaving(false);
    }
  }

  async function handleProjectMemberRoleChange(member, role) {
    try {
      setSaving(true);
      const now = new Date().toISOString();
      await updateProjectMember(member.$id, { role, updatedAt: now });
      const user = directoryUsers.find((entry) => entry.$id === member.userId);
      await logAudit({
        projectId: member.projectId,
        entityType: "project_member",
        actionType: "project_member_role_changed",
        message: `${user?.name || user?.email || "Member"} role changed to ${role}.`,
      });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to update member role.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveProjectMember(member) {
    try {
      setSaving(true);
      const now = new Date().toISOString();
      await updateProjectMember(member.$id, { isActive: false, updatedAt: now });
      const user = directoryUsers.find((entry) => entry.$id === member.userId);
      await logAudit({
        projectId: member.projectId,
        entityType: "project_member",
        actionType: "project_member_removed",
        message: `${user?.name || user?.email || "Member"} was removed from the project.`,
      });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to remove project member.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSprint() {
    if (!sprintForm.name.trim() || !sprintForm.projectId) return;
    try {
      setSaving(true);
      const now = new Date().toISOString();
      if (sprintDialogMode === "edit" && editingSprint) {
        await updateSprint(editingSprint.$id, {
          projectId: sprintForm.projectId,
          name: sprintForm.name.trim(),
          goal: sprintForm.goal.trim(),
          status: sprintForm.status || editingSprint.status || "Planning",
          startDate: sprintForm.startDate || "",
          endDate: sprintForm.endDate || "",
          closedAt:
            (sprintForm.status || editingSprint.status) === "Closed"
              ? editingSprint.closedAt || now
              : "",
          updatedAt: now,
          updatedByUserId: actorUserId,
        });
        await logAudit({
          projectId: sprintForm.projectId,
          entityType: "sprint",
          actionType: "sprint_updated",
          message: `Sprint ${sprintForm.name.trim()} was updated.`,
        });
      } else {
        await createSprint({
          projectId: sprintForm.projectId,
          name: sprintForm.name.trim(),
          goal: sprintForm.goal.trim(),
          status: "Planning",
          startDate: sprintForm.startDate || "",
          endDate: sprintForm.endDate || "",
          closedAt: "",
          committedTaskIds: [],
          createdAt: now,
          updatedAt: now,
          createdByUserId: actorUserId,
          updatedByUserId: actorUserId,
        });
        await logAudit({
          projectId: sprintForm.projectId,
          entityType: "sprint",
          actionType: "sprint_created",
          message: `Sprint ${sprintForm.name.trim()} was created.`,
        });
      }
      await loadAll();
      setSprintDialogOpen(false);
      setSprintDialogMode("create");
      setEditingSprintId(null);
      setSprintForm({ name: "", goal: "", startDate: "", endDate: "", projectId: selectedProject?.$id || "", status: "Planning" });
      setPage("sprints");
    } catch (err) {
      setError(err.message || "Failed to save sprint.");
    } finally {
      setSaving(false);
    }
  }

  function openCreateSprintDialog() {
    setSprintDialogMode("create");
    setEditingSprintId(null);
    setSprintForm({
      name: "",
      goal: "",
      startDate: "",
      endDate: "",
      projectId: selectedProject?.$id || "",
      status: "Planning",
    });
    setSprintDialogOpen(true);
  }

  function openEditSprintDialog(sprint) {
    setSprintDialogMode("edit");
    setEditingSprintId(sprint.$id);
    setSprintForm({
      name: sprint.name || "",
      goal: sprint.goal || "",
      startDate: sprint.startDate || "",
      endDate: sprint.endDate || "",
      projectId: sprint.projectId || "",
      status: sprint.status || "Planning",
    });
    setSprintDialogOpen(true);
  }

  async function handleSprintStatusChange(sprint, nextStatus) {
    try {
      setSaving(true);
      const now = new Date().toISOString();
      await updateSprint(sprint.$id, {
        status: nextStatus,
        startDate: nextStatus === "Active" ? sprint.startDate || now : sprint.startDate || "",
        closedAt: nextStatus === "Closed" ? now : sprint.closedAt || "",
        updatedAt: now,
        updatedByUserId: actorUserId,
      });
      await logAudit({
        projectId: sprint.projectId,
        entityType: "sprint",
        actionType: `sprint_${nextStatus.toLowerCase()}`,
        message: `Sprint ${sprint.name} moved to ${nextStatus}.`,
      });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to update sprint.");
    } finally {
      setSaving(false);
    }
  }

  async function commitTaskToSprint(task, sprintId) {
    try {
      const sprint = sprints.find((item) => item.$id === sprintId);
      if (!sprint) return;
      const nextCommitted = Array.from(new Set([...(sprint.committedTaskIds || []), task.$id]));
      await updateTask(task.$id, { sprintId, updatedAt: new Date().toISOString(), updatedByUserId: actorUserId });
      await updateSprint(sprintId, {
        committedTaskIds: nextCommitted,
        updatedAt: new Date().toISOString(),
        updatedByUserId: actorUserId,
      });
      await logAudit({
        taskId: task.$id,
        projectId: task.projectId,
        actionType: "sprint_commit",
        message: `${task.title} was committed to sprint ${sprint.name}.`,
        meta: { sprintId },
      });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to commit task to sprint.");
    }
  }

  async function uncommitTaskFromSprint(task, sprintId) {
    try {
      const sprint = sprints.find((item) => item.$id === sprintId);
      if (!sprint) return;
      await updateTask(task.$id, { sprintId: "", updatedAt: new Date().toISOString(), updatedByUserId: actorUserId });
      await updateSprint(sprintId, {
        committedTaskIds: (sprint.committedTaskIds || []).filter((item) => item !== task.$id),
        updatedAt: new Date().toISOString(),
        updatedByUserId: actorUserId,
      });
      await logAudit({
        taskId: task.$id,
        projectId: task.projectId,
        actionType: "sprint_uncommit",
        message: `${task.title} was removed from sprint ${sprint.name}.`,
        meta: { sprintId },
      });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to remove task from sprint.");
    }
  }

  async function processRecurringTasks(taskDocs = tasks) {
    const now = new Date();
    let nextTaskNo = getLatestTaskNo(taskDocs);
    const dueRecurring = taskDocs.filter((task) => {
      if (!task.recurringEnabled || !task.recurringFrequency) return false;
      const nextDate = getNextRecurringDate(task);
      return nextDate <= now && !task.sourceTaskId;
    });

    if (dueRecurring.length === 0) return;

    for (const task of dueRecurring) {
      const nextDate = getNextRecurringDate(task);
      nextTaskNo += 1;
      const created = await createTask({
        projectId: task.projectId || "",
        sprintId: "",
        assignedToUserId: task.assignedToUserId || "",
        assignedToName: task.assignedToName || "",
        taskNo: `TNO-${nextTaskNo}`,
        title: task.title,
        description: task.description || "",
        status: "Backlog",
        priority: task.priority,
        dueDate: task.dueDate ? format(nextDate, "yyyy-MM-dd") : "",
        estimateHours: Math.round(getTaskEstimateMinutes(task) / 60),
        estimateMinutes: getTaskEstimateMinutes(task),
        actualHours: null,
        actualMinutes: null,
        labels: task.labels || [],
        isActive: true,
        recurringEnabled: false,
        recurringFrequency: "",
        recurringInterval: null,
        lastRecurringAt: "",
        sourceTaskId: task.$id,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        completedAt: "",
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
      });
      await updateTask(task.$id, {
        lastRecurringAt: now.toISOString(),
        updatedAt: now.toISOString(),
        updatedByUserId: actorUserId,
      });
      await logAudit({
        taskId: created.$id,
        projectId: created.projectId,
        actionType: "recurring_generated",
        message: `Recurring task created from ${task.title}.`,
        meta: { sourceTaskId: task.$id, frequency: task.recurringFrequency },
      });
    }

    await loadAll();
  }

  async function logAudit({ taskId = "", projectId = "", entityType = "task", actionType, message, meta }) {
    try {
      await createAuditEntry({
        taskId,
        projectId,
        entityType,
        actionType,
        message,
        meta: meta ? JSON.stringify(meta) : "",
        createdAt: new Date().toISOString(),
        createdBy: actorName,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
      });
    } catch {
      // Best-effort audit trail; UI actions should not fail if audit logging is unavailable.
    }
  }

  function openCreate() {
    setEditorMode("create");
    setSelectedTaskId(null);
    setEditorOpen(true);
    setPage("taskboard");
  }

  function handleQuickAction(action) {
    setQuickActionSelected(action);
    if (action === "create") {
      openCreate();
      return;
    }
    if (action === "sprint") {
      openCreateSprintDialog();
      return;
    }
    if (action === "feedback") {
      setPage("feedback");
    }
  }

  function openEdit(taskId, nextPage = page) {
    setSelectedTaskId(taskId);
    setEditorMode("edit");
    setEditorOpen(true);
    setPage(nextPage);
  }

  async function duplicateTask(task) {
    try {
      setSaving(true);
      const now = new Date().toISOString();
      const duplicated = await createTask({
        taskNo: `TNO-${getLatestTaskNo(tasks) + 1}`,
        projectId: task.projectId || "",
        sprintId: "",
        assignedToUserId: task.assignedToUserId || "",
        assignedToName: task.assignedToName || "",
        title: `${task.title} - `,
        description: task.description || "",
        status: "Backlog",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || "",
        estimateHours: Math.round(getTaskEstimateMinutes(task) / 60),
        estimateMinutes: getTaskEstimateMinutes(task),
        actualHours: null,
        actualMinutes: null,
        labels: task.labels || [],
        isActive: true,
        recurringEnabled: Boolean(task.recurringEnabled),
        recurringFrequency: task.recurringEnabled ? task.recurringFrequency || "" : "",
        recurringInterval: task.recurringEnabled ? task.recurringInterval || 1 : null,
        lastRecurringAt: "",
        sourceTaskId: "",
        createdAt: now,
        updatedAt: now,
        completedAt: "",
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
      });

      const sourceSubtasks = taskSubtasks(task.$id).filter((item) => item.isActive !== false);
      if (sourceSubtasks.length) {
        await Promise.all(
          sourceSubtasks.map((item) =>
            createSubtask({
              taskId: duplicated.$id,
              title: item.title,
              status: item.status,
              createdAt: now,
              createdBy: actorName,
              createdByUserId: actorUserId,
              updatedByUserId: actorUserId,
              isActive: true,
            }),
          ),
        );
      }

      await logAudit({
        taskId: duplicated.$id,
        projectId: duplicated.projectId,
        actionType: "task_duplicated",
        message: `${task.title} was duplicated.`,
        meta: { sourceTaskId: task.$id },
      });

      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to duplicate task.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTask(formData, draftSubtasks) {
    const now = new Date().toISOString();
    setSaving(true);
    try {
      const estimateMinutes = hoursToMinutes(formData.estimateHours) ?? 0;
      const actualMinutes = formData.actualHours === "" ? null : hoursToMinutes(formData.actualHours);
      const payload = {
        projectId: formData.projectId || (activeProjectId !== "all" ? activeProjectId : ""),
        sprintId: formData.sprintId || "",
        assignedToUserId: formData.assignedToUserId || "",
        assignedToName: formData.assignedToName || "",
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || "",
        estimateHours: Math.round(estimateMinutes / 60),
        estimateMinutes,
        actualHours: actualMinutes === null ? null : Math.round(actualMinutes / 60),
        actualMinutes,
        labels: formData.labels,
        isActive: true,
        recurringEnabled: Boolean(formData.recurringEnabled),
        recurringFrequency: formData.recurringEnabled ? formData.recurringFrequency : "",
        recurringInterval: formData.recurringEnabled ? Math.max(1, numberOrZero(formData.recurringInterval)) : null,
        lastRecurringAt: selectedTask?.lastRecurringAt || "",
        sourceTaskId: selectedTask?.sourceTaskId || "",
        updatedAt: now,
        updatedByUserId: actorUserId,
      };

      let taskId = selectedTaskId;
      if (editorMode === "create") {
        const created = await createTask({
          ...payload,
          taskNo: `TNO-${getLatestTaskNo(tasks) + 1}`,
          createdAt: now,
          completedAt: formData.status === "Done" ? now : "",
          createdByUserId: actorUserId,
        });
        taskId = created.$id;
        await logAudit({
          taskId,
          projectId: payload.projectId,
          actionType: "task_created",
          message: `Task ${payload.title} was created.`,
          meta: { status: payload.status, priority: payload.priority, sprintId: payload.sprintId || "" },
        });
      } else {
        await updateTask(selectedTaskId, {
          ...payload,
          completedAt: formData.status === "Done" ? selectedTask?.completedAt || now : "",
        });
        await logAudit({
          taskId: selectedTaskId,
          projectId: payload.projectId,
          actionType: "task_updated",
          message: `Task ${payload.title} was updated.`,
          meta: {
            fromStatus: selectedTask?.status,
            toStatus: payload.status,
            fromPriority: selectedTask?.priority,
            toPriority: payload.priority,
          },
        });
      }

      if (editorMode === "create" && draftSubtasks.length > 0) {
        await Promise.all(
          draftSubtasks
            .filter((item) => item.isActive !== false && item.title.trim())
            .map((item) =>
              createSubtask({
                taskId,
                title: item.title.trim(),
                status: item.status,
                createdAt: item.createdAt || now,
                createdBy: item.createdBy || actorName,
                createdByUserId: actorUserId,
                updatedByUserId: actorUserId,
                isActive: true,
              }),
            ),
        );
      }

      await loadAll();
      setEditorOpen(false);
    } catch (err) {
      setError(err.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(task, status) {
    try {
      const now = new Date().toISOString();
      await updateTask(task.$id, {
        status,
        updatedAt: now,
        completedAt: status === "Done" ? now : "",
        updatedByUserId: actorUserId,
      });
      setTasks((current) =>
        current.map((item) =>
          item.$id === task.$id
            ? {
                ...item,
                status,
                updatedAt: now,
                completedAt: status === "Done" ? now : "",
              }
            : item,
        ),
      );
      await logAudit({
        taskId: task.$id,
        projectId: task.projectId,
        actionType: "status_changed",
        message: `${task.title} moved from ${task.status} to ${status}.`,
        meta: { from: task.status, to: status },
      });
      return true;
    } catch (err) {
      setError(err.message || "Failed to update status.");
      await loadAll();
      return false;
    }
  }

  async function softDeleteTask(task) {
    try {
      setSaving(true);
      await updateTask(task.$id, {
        isActive: false,
        updatedAt: new Date().toISOString(),
        updatedByUserId: actorUserId,
      });
      await logAudit({
        taskId: task.$id,
        projectId: task.projectId,
        actionType: "task_deleted",
        message: `${task.title} was soft deleted.`,
      });
      setEditorOpen(false);
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to delete task.");
    } finally {
      setSaving(false);
    }
  }

  function handleBoardDragStart(event) {
    setActiveDragTaskId(event.active?.id || null);
    const task = filteredTasks.find((item) => item.$id === event.active?.id);
    setActiveDragOriginStatus(task?.status || "");
  }

  function handleBoardDragOver(event) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active?.id;
    const nextStatus = over.data.current?.status || over.id;
    if (!activeId || !STATUS_OPTIONS.includes(nextStatus)) return;

    setTasks((current) =>
      current.map((task) =>
        task.$id === activeId && task.status !== nextStatus
          ? {
              ...task,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
              completedAt: nextStatus === "Done" ? new Date().toISOString() : task.completedAt || "",
            }
          : task,
      ),
    );
  }

  async function handleBoardDragEnd(event) {
    const { active, over } = event;
    setActiveDragTaskId(null);
    const originalStatus = activeDragOriginStatus;
    setActiveDragOriginStatus("");
    if (!over) return;
    const task = filteredTasks.find((item) => item.$id === active.id);
    const newStatus = over.data.current?.status || over.id;
    if (!task || !newStatus || originalStatus === newStatus) return;
    const ok = await handleStatusChange(task, newStatus);
    if (!ok) {
      await loadAll();
      return;
    }
    setTasks((current) =>
      current.map((item) =>
        item.$id === task.$id
          ? {
              ...item,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              completedAt: newStatus === "Done" ? new Date().toISOString() : item.completedAt || "",
            }
          : item,
      ),
    );
  }

  async function handleBoardDragCancel() {
    setActiveDragTaskId(null);
    setActiveDragOriginStatus("");
    await loadAll();
  }

  useEffect(() => {
    if (!loading && tasks.length > 0) {
      processRecurringTasks(tasks).catch(() => {});
    }
  }, [loading]);

  const overdueTasks = useMemo(() => filteredTasks.filter(isOverdueTask), [filteredTasks]);
  const greeting = `${getGreeting()}, India team`;
  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        (task.description || "").toLowerCase().includes(term),
    );
  }, [searchTerm, filteredTasks]);

  const doneColumnTasks = useMemo(() => {
    const doneTasks = sortTasks(filteredTasks.filter((task) => task.status === "Done"));
    const threshold = subDays(kolkataNow(), 4);
    const recentDaysTasks = doneTasks.filter((task) =>
      task.completedAt ? Date.parse(task.completedAt) >= threshold.getTime() : false,
    );
    return doneTasks.slice(0, Math.max(7, recentDaysTasks.length));
  }, [filteredTasks]);

  const analytics = useMemo(() => {
    const totalTasks = filteredTasks.length;
    const doneTasks = filteredTasks.filter((task) => task.status === "Done");
    const openTasks = filteredTasks.filter((task) => task.status !== "Done");
    const inProgressTasks = filteredTasks.filter((task) => task.status === "In Progress");
    const backlogTasks = filteredTasks.filter((task) => task.status === "Backlog");
    const sevenDaysAgo = subDays(new Date(), 7).getTime();
    const throughput7d = doneTasks.filter((task) =>
      task.completedAt ? Date.parse(task.completedAt) >= sevenDaysAgo : false,
    ).length;
    const created7d = filteredTasks.filter((task) =>
      task.createdAt ? Date.parse(task.createdAt) >= sevenDaysAgo : false,
    ).length;
    const cycleSamples = doneTasks
      .map((task) => getTaskLifecycleDays(task, "createdAt", "completedAt"))
      .filter((value) => value !== null);
    const leadSamples = doneTasks
      .map((task) => getTaskLifecycleDays(task, "updatedAt", "completedAt"))
      .filter((value) => value !== null);
    const estimateVarianceMinutes =
      filteredTasks.reduce((sum, task) => {
        const estimateMinutes = getTaskEstimateMinutes(task);
        const actualMinutes = getTaskActualMinutes(task);
        return sum + Math.abs((actualMinutes ?? 0) - estimateMinutes);
      }, 0) / Math.max(1, filteredTasks.length);
    const doneSubtaskCount = activeSubtasks.filter((item) => {
      if (item.status !== "Done") return false;
      if (activeProjectId === "all") return true;
      const owner = tasks.find((entry) => entry.$id === item.taskId);
      return owner?.projectId === activeProjectId;
    }).length;

    const now = new Date();
    const dayBuckets = eachDayOfInterval({
      start: startOfDay(subDays(now, 6)),
      end: endOfDay(now),
    }).map((date) => ({
      key: format(date, "yyyy-MM-dd"),
      label: format(date, "dd MMM"),
      count: 0,
      createdCount: 0,
    }));

    const weekBuckets = eachWeekOfInterval(
      {
        start: startOfWeek(subWeeks(now, 4), { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      },
      { weekStartsOn: 1 },
    ).map((date) => ({
      key: format(date, "yyyy-MM-dd"),
      label: `Wk ${format(date, "dd MMM")}`,
      count: 0,
      createdCount: 0,
    }));

    const monthBuckets = eachMonthOfInterval({
      start: startOfMonth(subMonths(now, 5)),
      end: endOfMonth(now),
    }).map((date) => ({
      key: format(date, "yyyy-MM"),
      label: format(date, "MMM"),
      count: 0,
      createdCount: 0,
    }));

    filteredTasks.forEach((task) => {
      if (!task.createdAt) return;
      const createdDate = parseISO(task.createdAt);
      const dayKey = format(createdDate, "yyyy-MM-dd");
      const weekKey = format(startOfWeek(createdDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const monthKey = format(createdDate, "yyyy-MM");
      const dayBucket = dayBuckets.find((item) => item.key === dayKey);
      if (dayBucket) dayBucket.createdCount += 1;
      const weekBucket = weekBuckets.find((item) => item.key === weekKey);
      if (weekBucket) weekBucket.createdCount += 1;
      const monthBucket = monthBuckets.find((item) => item.key === monthKey);
      if (monthBucket) monthBucket.createdCount += 1;
    });

    doneTasks.forEach((task) => {
      if (!task.completedAt) return;
      const completedDate = parseISO(task.completedAt);
      const dayKey = format(completedDate, "yyyy-MM-dd");
      const weekKey = format(startOfWeek(completedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const monthKey = format(completedDate, "yyyy-MM");
      const dayBucket = dayBuckets.find((item) => item.key === dayKey);
      if (dayBucket) dayBucket.count += 1;
      const weekBucket = weekBuckets.find((item) => item.key === weekKey);
      if (weekBucket) weekBucket.count += 1;
      const monthBucket = monthBuckets.find((item) => item.key === monthKey);
      if (monthBucket) monthBucket.count += 1;
    });

    const productivity = {
      day: dayBuckets,
      week: weekBuckets,
      month: monthBuckets,
    };

    const productivityPeak = {
      day: [...dayBuckets].sort((a, b) => b.count - a.count)[0] || { label: "-", count: 0 },
      week: [...weekBuckets].sort((a, b) => b.count - a.count)[0] || { label: "-", count: 0 },
      month: [...monthBuckets].sort((a, b) => b.count - a.count)[0] || { label: "-", count: 0 },
    };

    const statusMix = STATUS_OPTIONS.map((status) => ({
      label: status,
      count: filteredTasks.filter((task) => task.status === status).length,
    }));
    const priorityMix = PRIORITY_OPTIONS.map((priority) => ({
      label: priority,
      count: filteredTasks.filter((task) => task.priority === priority).length,
    }));
    const deadlineLane = buildTimelineSeries(
      filteredTasks.filter((task) => task.status !== "Done" && task.dueDate),
      "due",
    );
    const heatmapSeries = eachDayOfInterval({
      start: startOfDay(subDays(now, 27)),
      end: endOfDay(now),
    }).map((date) => ({
      key: format(date, "yyyy-MM-dd"),
      label: format(date, "dd MMM"),
      count: doneTasks.filter((task) => task.completedAt && format(parseISO(task.completedAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")).length,
    }));
    const cumulativeFlow = eachDayOfInterval({
      start: startOfDay(subDays(now, 13)),
      end: endOfDay(now),
    }).map((date) => {
      const stamp = date.getTime();
      return {
        label: format(date, "dd MMM"),
        backlog: filteredTasks.filter((task) => Date.parse(task.createdAt || 0) <= stamp && task.status === "Backlog").length,
        inProgress: filteredTasks.filter((task) => Date.parse(task.createdAt || 0) <= stamp && task.status === "In Progress").length,
        done: filteredTasks.filter((task) => task.completedAt && Date.parse(task.completedAt) <= stamp).length,
      };
    });
    const aiUsageCount = auditEntries.filter((entry) =>
      String(entry.actionType || "").startsWith("ai_") &&
      (activeProjectId === "all" || entry.projectId === activeProjectId),
    ).length;
    const reopenRateBase = auditEntries.filter((entry) =>
      entry.actionType === "status_changed" &&
      (activeProjectId === "all" || entry.projectId === activeProjectId),
    );
    const reopenedCount = reopenRateBase.filter((entry) => {
      const meta = getAuditMeta(entry);
      return meta?.from === "Done" && meta?.to !== "Done";
    }).length;
    const projectHealth = computeProjectHealth(filteredTasks);
    const unassignedTasksCount = openTasks.filter((task) => !task.assignedToUserId).length;
    const riskBreakdown = [
      { name: "Overdue", value: overdueTasks.length },
      { name: "Unassigned", value: unassignedTasksCount },
      {
        name: "Due in 3d",
        value: openTasks.filter((task) => {
          if (!task.dueDate) return false;
          const dueTime = Date.parse(task.dueDate);
          const nowTime = Date.now();
          return Number.isFinite(dueTime) && dueTime >= nowTime && dueTime <= nowTime + 3 * 24 * 60 * 60 * 1000;
        }).length,
      },
    ];
    const assigneeMap = new Map();
    filteredTasks.forEach((task) => {
      const key = task.assignedToUserId || task.assignedToName || "unassigned";
      const label = task.assignedToName || task.assignedToUserId || "Unassigned";
      const current = assigneeMap.get(key) || {
        key,
        label,
        planned: 0,
        actual: 0,
        count: 0,
        openCount: 0,
        doneCount: 0,
      };
      current.planned += getTaskEstimateMinutes(task);
      current.actual += getTaskActualMinutes(task) ?? 0;
      current.count += 1;
      if (task.status === "Done") current.doneCount += 1;
      else current.openCount += 1;
      assigneeMap.set(key, current);
    });
    const assigneeLoad = [...assigneeMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        plannedHours: Number((item.planned / 60).toFixed(1)),
        actualHours: Number((item.actual / 60).toFixed(1)),
      }));
    const myAssignedTasks = actorUserId ? filteredTasks.filter((task) => task.assignedToUserId === actorUserId) : [];
    const myOpenAssignedTasks = myAssignedTasks.filter((task) => task.status !== "Done");
    const myFocus = {
      name: actorName,
      openCount: myOpenAssignedTasks.length,
      doneCount: myAssignedTasks.filter((task) => task.status === "Done").length,
      overdueCount: myOpenAssignedTasks.filter(isOverdueTask).length,
      plannedMinutes: myOpenAssignedTasks.reduce((sum, task) => sum + getTaskEstimateMinutes(task), 0),
      actualMinutes: myOpenAssignedTasks.reduce((sum, task) => sum + (getTaskActualMinutes(task) ?? 0), 0),
    };
    const sprint = activeSprint;
    const sprintCommittedTasks = sprint
      ? filteredTasks.filter((task) => (sprint.committedTaskIds || []).includes(task.$id))
      : [];
    const sprintCompleted = sprintCommittedTasks.filter((task) => task.status === "Done").length;
    const sprintPredictability = sprintCommittedTasks.length
      ? Math.round((sprintCompleted / sprintCommittedTasks.length) * 100)
      : 0;
    const burndownSeries = sprint
      ? eachDayOfInterval({
          start: safeDate(sprint.startDate) || startOfDay(new Date()),
          end: safeDate(sprint.endDate) || endOfDay(addDays(new Date(), 6)),
        }).map((date, index) => {
          const total = sprintCommittedTasks.length;
          const remaining = sprintCommittedTasks.filter((task) => {
            const completedAt = safeDate(task.completedAt);
            return !completedAt || completedAt > endOfDay(date);
          }).length;
          return {
            label: format(date, "dd MMM"),
            ideal: Math.max(0, total - Math.round((total / Math.max(1, sprintCommittedTasks.length || 1)) * index)),
            remaining,
            completed: total - remaining,
          };
        })
      : [];
    const sprintCards = [
      {
        $id: "all-sprints",
        name: "All Sprints",
        status: selectedProject?.name || "Cross-project scope",
        committed: filteredTasks.length,
        completed: doneTasks.length,
        rollover: openTasks.length,
        health: projectHealth,
      },
      ...filteredSprints.map((sprintItem) => {
        const sprintTasks = filteredTasks.filter((task) => task.sprintId === sprintItem.$id);
        const completed = sprintTasks.filter((task) => task.status === "Done").length;
        const rollover = sprintTasks.filter((task) => task.status !== "Done").length;
        return {
          $id: sprintItem.$id,
          name: sprintItem.name,
          status: sprintItem.status,
          committed: sprintTasks.length,
          completed,
          rollover,
          health: computeProjectHealth(sprintTasks),
        };
      }),
    ];

    return {
      totalTasks,
      doneToday: doneTasks.filter((task) => formatDate(task.completedAt, "") === formatDate(new Date().toISOString(), "")).length,
      completionRate: totalTasks ? Math.round((doneTasks.length / totalTasks) * 100) : 0,
      inProgress: inProgressTasks.length,
      backlog: backlogTasks.length,
      throughput7d,
      overdue: overdueTasks.length,
      created7d,
      avgCycleTime: cycleSamples.length ? (cycleSamples.reduce((sum, value) => sum + value, 0) / cycleSamples.length).toFixed(1) : "0.0",
      avgLeadTime: leadSamples.length ? (leadSamples.reduce((sum, value) => sum + value, 0) / leadSamples.length).toFixed(1) : "0.0",
      overdueRate: totalTasks ? Math.round((overdueTasks.length / totalTasks) * 100) : 0,
      reopenRate: reopenRateBase.length ? Math.round((reopenedCount / reopenRateBase.length) * 100) : 0,
      estimateAccuracy: `${Math.max(0, 100 - Math.round((estimateVarianceMinutes / 60) * 10))}%`,
      subtaskCompletionRatio: activeSubtasks.length
        ? Math.round((doneSubtaskCount / activeSubtasks.length) * 100)
        : 0,
      aiUsageCount,
      projectHealth,
      sprintPredictability,
      deadlineLane,
      heatmapSeries,
      cumulativeFlow,
      statusMix,
      priorityMix,
      burndownSeries,
      openSubtasks: activeSubtasks
        .filter((item) => item.status !== "Done")
        .filter((item) => {
          if (activeProjectId === "all") return true;
          const task = tasks.find((entry) => entry.$id === item.taskId);
          return task?.projectId === activeProjectId;
        }).length,
      monthSeries: STATUS_OPTIONS.map((status) => ({
        label: status,
        count: filteredTasks.filter((task) => task.status === status).length,
      })),
      workloadSeries: filteredTasks.slice(0, 8).map((task) => ({
        label: task.title.slice(0, 14) || task.taskNo,
        planned: Number((getTaskEstimateMinutes(task) / 60).toFixed(1)),
        actual: Number((((getTaskActualMinutes(task) ?? 0) / 60)).toFixed(1)),
      })),
      assigneeLoad,
      riskBreakdown,
      sprintCards,
      myFocus,
      unassignedTasksCount,
      estimateVarianceMinutes: Math.round(estimateVarianceMinutes),
      productivity,
      productivityPeak,
      kpiSparklines: {
        throughput: sparklineFromCounts(dayBuckets),
        created: sparklineFromCounts(
          dayBuckets.map((bucket) => ({
            ...bucket,
            count: filteredTasks.filter((task) => task.createdAt && format(parseISO(task.createdAt), "yyyy-MM-dd") === bucket.key).length,
          })),
        ),
      },
    };
  }, [filteredTasks, overdueTasks, activeSubtasks, activeProjectId, tasks, auditEntries, activeSprint, actorUserId, actorName, selectedProject, filteredSprints]);

  async function generateScript() {
    try {
      setScriptLoading(true);
      const eligibleTasks = filteredTasks.filter((task) => !includesLabel(task, "DNI"));
      let scriptTasks = eligibleTasks;
      let scriptContext = {
        scope: selectedProject ? selectedProject.name : "All Projects",
        mode: scriptMode,
      };
      if (scriptMode === "dsm") {
        const latestCreated = eligibleTasks.reduce(
          (latest, task) => Math.max(latest, Date.parse(task.createdAt || 0)),
          0,
        );
        const latestDate = latestCreated ? new Date(latestCreated) : kolkataNow();
        const previousDate = subDays(latestDate, 1);
        const latestDateKey = format(latestDate, "yyyy-MM-dd");
        const previousDateKey = format(previousDate, "yyyy-MM-dd");
        scriptTasks = eligibleTasks.filter((task) => {
          const createdAt = task.createdAt ? parseISO(task.createdAt) : null;
          const completedAt = task.completedAt ? parseISO(task.completedAt) : null;
          return (
            (createdAt &&
              [latestDateKey, previousDateKey].includes(format(createdAt, "yyyy-MM-dd"))) ||
            (completedAt &&
              [latestDateKey, previousDateKey].includes(format(completedAt, "yyyy-MM-dd")))
          );
        });
        scriptContext = {
          ...scriptContext,
          windowType: "latest-created-day-and-previous-day",
          latestCreatedDate: latestDateKey,
          previousDate: previousDateKey,
          rule:
            "Use only non-DNI tasks created on the latest created date or the previous date, plus tasks completed on those same two dates.",
        };
      } else {
        const now = kolkataNow();
        const start = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
        const end = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });
        scriptTasks = eligibleTasks.filter(
          (task) =>
            isWithinDateRange(task.createdAt, start, end) ||
            isWithinDateRange(task.completedAt, start, end),
        );
        scriptContext = {
          ...scriptContext,
          windowType: "last-complete-monday-to-sunday",
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(end, "yyyy-MM-dd"),
          rule:
            "Use only non-DNI tasks created or completed within the last completed Monday-to-Sunday period.",
        };
      }

      const enriched = scriptTasks.map((task) => ({
        ...task,
        includedBecause: {
          createdAt: task.createdAt || "",
          completedAt: task.completedAt || "",
        },
        comments: taskComments(task.$id).map((comment) => ({
          commentText: comment.commentText,
          createdAt: comment.createdAt,
          createdBy: comment.createdBy,
        })),
        subtasks: taskSubtasks(task.$id).map((subtask) => ({
          title: subtask.title,
          status: subtask.status,
        })),
      }));

      const result = await runAiAction({
        action: "script",
        mode: scriptMode,
        context: {
          ...scriptContext,
          taskCount: enriched.length,
          generatedAt: new Date().toISOString(),
        },
        tasks: enriched,
      });
      setScriptOutput(result.output || "");
      await logAudit({
        projectId: activeProjectId === "all" ? "" : activeProjectId,
        entityType: "ai",
        actionType: "ai_script_generated",
        message: `${scriptMode.toUpperCase()} script generated.`,
        meta: { mode: scriptMode, taskCount: enriched.length },
      });
    } catch (err) {
      setError(err.message || "Failed to generate script.");
    } finally {
      setScriptLoading(false);
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return;
    const nextMessages = [...chatMessages, { role: "user", content: chatInput.trim() }];
    setChatMessages(nextMessages);
    setChatInput("");
    try {
      const result = await runAiAction({ action: "chat", messages: nextMessages });
      setChatMessages([...nextMessages, { role: "assistant", content: result.output || "" }]);
      await logAudit({
        projectId: activeProjectId === "all" ? "" : activeProjectId,
        entityType: "ai",
        actionType: "ai_chat_message",
        message: "AI script enhancer responded.",
      });
    } catch (err) {
      setError(err.message || "Chat request failed.");
    }
  }

  async function generateStandupDigest() {
    try {
      setStandupLoading(true);
      const today = format(kolkataNow(), "yyyy-MM-dd");
      const context = {
        date: today,
        blockers: filteredTasks.filter(isOverdueTask).map((task) => ({
          title: task.title,
          status: task.status,
          dueDate: task.dueDate,
        })),
        progress: filteredTasks
          .filter((task) => task.completedAt && format(parseISO(task.completedAt), "yyyy-MM-dd") === today)
          .map((task) => ({ title: task.title, status: task.status })),
        nextSteps: filteredTasks
          .filter((task) => task.status !== "Done")
          .slice(0, 5)
          .map((task) => ({ title: task.title, status: task.status, priority: task.priority })),
      };
      const result = await runAiAction({ action: "standup_digest", context });
      setStandupDigest(result.output || "");
      await logAudit({
        projectId: activeProjectId === "all" ? "" : activeProjectId,
        entityType: "ai",
        actionType: "ai_standup_digest",
        message: "AI standup digest generated.",
        meta: { blockers: context.blockers.length, progress: context.progress.length },
      });
    } catch (err) {
      setError(err.message || "Failed to generate standup digest.");
    } finally {
      setStandupLoading(false);
    }
  }

  function openStandupDigestModal() {
    setStandupModalOpen(true);
    setStandupMinimized(false);
    if (!standupDigest && !standupLoading) {
      generateStandupDigest();
    }
  }

  function openImage(url) {
    setImageViewer({ open: true, url, zoom: 1, x: 0, y: 0 });
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f6] text-[#23242a]">
        <div className="flex items-center gap-3 rounded-[24px] border border-[#e8e8ec] bg-white px-6 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <LoaderCircle className="h-6 w-6 animate-spin text-[#2160ff]" />
          <div>
            <p className="font-semibold">Restoring session</p>
            <p className="text-sm text-[#7b7c85]">Checking your Tasklane workspace access.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthPage
        mode={authMode}
        setMode={setAuthMode}
        form={authForm}
        setForm={setAuthForm}
        onSubmit={handleAuthSubmit}
        loading={authSubmitting}
        error={error}
      />
    );
  }

  return (
    <div className={cn("theme-app min-h-screen text-[#23242a]", themeMode === "dark" ? "theme-dark" : "theme-light")}>
      <div className="flex min-h-screen">
        <Sidebar
          themeMode={themeMode}
          page={page}
          onChangePage={setPage}
          notesScope={notesScope}
          onChangeNotesScope={setNotesScope}
          personalNotes={personalNotes}
          projectNotes={projectNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          projects={activeProjects}
          activeProjectId={activeProjectId}
          collapsed={sidebarCollapsed}
          onSelectProject={(projectId) => {
            setActiveProjectId(projectId);
            setPage("taskboard");
          }}
          onCreateProject={openCreateProjectDialog}
          onCreate={openCreate}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar
            overdueTasks={overdueTasks}
            themeMode={themeMode}
            onToggleTheme={() => setThemeMode((value) => (value === "dark" ? "light" : "dark"))}
            searchOpen={searchOpen}
            notificationsOpen={notificationsOpen}
            onSearchOpen={() => {
              setNotificationsOpen(false);
              setSearchOpen((value) => !value);
            }}
            onNotificationOpen={() => {
              setSearchOpen(false);
              setProfileOpen(false);
              setNotificationsOpen((value) => !value);
            }}
            searchRef={searchRef}
            notificationRef={notificationRef}
            profileRef={profileRef}
            searchResults={searchResults}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            assigneeOptions={assigneeOptions}
            openTask={(taskId) => {
              openEdit(taskId);
              setSearchOpen(false);
            }}
            selectedProject={selectedProject}
            currentUser={currentUser}
            profileOpen={profileOpen}
            onProfileOpen={() => {
              setSearchOpen(false);
              setNotificationsOpen(false);
              setProfileOpen((value) => !value);
            }}
            onOpenProfilePage={() => {
              setProfileOpen(false);
              setPage("profile");
            }}
            onOpenFeedbackPage={() => {
              setProfileOpen(false);
              setPage("feedback");
            }}
            canManageSelectedProject={canManageSelectedProject}
            onOpenEditProject={() => openEditProjectDialog(selectedProject)}
            onOpenProjectAccess={openProjectAccessDialog}
            onLogout={handleLogout}
          />
          <MobileNav
            themeMode={themeMode}
            page={page}
            onChangePage={setPage}
            notesScope={notesScope}
            onChangeNotesScope={setNotesScope}
            onCreate={openCreate}
            projects={activeProjects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onCreateProject={openCreateProjectDialog}
          />

          <main className="min-w-0 flex-1 p-2.5 sm:p-3 lg:p-4">
            {error ? (
              <Card className="mb-4 flex items-start gap-2.5 border border-rose-200 bg-rose-50 p-3.5">
                <AlertCircle className="mt-0.5 h-5 w-5 text-rose-500" />
                <div>
                  <p className="font-semibold text-rose-700">Configuration / API issue</p>
                  <p className="text-sm text-rose-600">{error}</p>
                </div>
              </Card>
            ) : null}

            {loading ? (
              <div className="flex h-[70vh] items-center justify-center">
                <LoaderCircle className="h-10 w-10 animate-spin text-[#2160ff]" />
              </div>
            ) : (
              <>
                {page === "dashboard" && (
                  <DashboardPageView
                    greeting={greeting}
                    analytics={analytics}
                    tasks={filteredTasks}
                    openTask={openEdit}
                    selectedProject={selectedProject}
                    projects={activeProjects}
                    activeProjectId={activeProjectId}
                    standupDigest={standupDigest}
                    standupLoading={standupLoading}
                    onOpenStandupDigest={openStandupDigestModal}
                    sprints={filteredSprints}
                    activeSprint={activeSprint}
                    currentUser={currentUser}
                  />
                )}
                {page === "taskboard" && (
                  <TaskBoardPageView
                    themeMode={themeMode}
                    tasks={filteredTasks}
                    doneColumnTasks={doneColumnTasks}
                    openTask={openEdit}
                    onDuplicateTask={duplicateTask}
                    onDragStart={handleBoardDragStart}
                    onDragOver={handleBoardDragOver}
                    onDragEnd={handleBoardDragEnd}
                    onDragCancel={handleBoardDragCancel}
                    sensors={sensors}
                    selectedProject={selectedProject}
                    projects={activeProjects}
                    activeDragTaskId={activeDragTaskId}
                  />
                )}
                {page === "sprints" && (
                  <SprintsPageView
                    sprints={filteredSprints}
                    tasks={filteredTasks}
                    activeSprint={activeSprint}
                    projects={activeProjects}
                    selectedProject={selectedProject}
                    onCreateSprint={openCreateSprintDialog}
                    onEditSprint={openEditSprintDialog}
                    onSprintStatusChange={handleSprintStatusChange}
                    onCommitTask={commitTaskToSprint}
                    onUncommitTask={uncommitTaskFromSprint}
                    analytics={analytics}
                  />
                )}
                {page === "activity" && (
                  <ActivityPageView
                    tasks={filteredTasks}
                    comments={activeComments}
                    openTask={openEdit}
                    auditEntries={auditEntries}
                  />
                )}
                {page === "manage" && (
                  <ManagePageView
                    tasks={filteredTasks}
                    sprints={filteredSprints}
                    projects={activeProjects}
                    selectedProject={selectedProject}
                    openTask={openEdit}
                    onStatusChange={handleStatusChange}
                  />
                )}
                {page === "notes" && (
                  <NotesPageView
                    scope={notesScope}
                    setScope={setNotesScope}
                    personalNotes={personalNotes}
                    projectNotes={projectNotes}
                    selectedNoteId={selectedNoteId}
                    setSelectedNoteId={setSelectedNoteId}
                    selectedProject={selectedProject}
                    projects={activeProjects}
                    onCreatePersonalNote={handleCreatePersonalNote}
                    onCreateProjectNote={handleCreateProjectNote}
                    onSaveNote={handleSaveNote}
                    onDeleteNote={handleDeleteNote}
                    saving={saving}
                  />
                )}
                {page === "aizone" && (
                  <AiZonePageView
                    scriptMode={scriptMode}
                    setScriptMode={setScriptMode}
                    scriptOutput={scriptOutput}
                    scriptLoading={scriptLoading}
                    onGenerateScript={generateScript}
                    chatMessages={chatMessages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    sendChatMessage={sendChatMessage}
                    selectedProject={selectedProject}
                  />
                )}
                {page === "profile" && (
                  <ProfilePageView
                    currentUser={currentUser}
                    profileForm={profileForm}
                    setProfileForm={setProfileForm}
                    onSave={handleSaveProfile}
                    saving={saving}
                  />
                )}
                {page === "feedback" && (
                  <FeedbackPageView
                    currentUser={currentUser}
                    feedbackForm={feedbackForm}
                    setFeedbackForm={setFeedbackForm}
                    onSubmit={handleSubmitFeedback}
                    saving={saving}
                    entries={myFeedbackEntries}
                  />
                )}
                {page === "testing" && (
                  <TestingLabPageView
                    analytics={analytics}
                    greeting={greeting}
                    activeSprint={activeSprint}
                    currentUser={currentUser}
                    projects={activeProjects}
                    selectedProject={selectedProject}
                    openTask={openEdit}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <TaskEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        task={selectedTask}
        mode={editorMode}
        taskComments={taskComments(selectedTaskId)}
        taskSubtasks={taskSubtasks(selectedTaskId)}
        onSave={handleSaveTask}
        onRefresh={loadAll}
        openImage={openImage}
        saving={saving}
        setError={setError}
        onDeleteTask={softDeleteTask}
        projects={activeProjects}
        sprints={filteredSprints}
        auditEntries={auditEntries.filter((entry) => entry.taskId === selectedTaskId)}
        selectedProjectId={activeProjectId === "all" ? "" : activeProjectId}
        actorName={actorName}
        actorUserId={actorUserId}
        directoryUsers={directoryUsers}
      />

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={(open) => {
          setProjectDialogOpen(open);
          if (!open) {
            setProjectDialogMode("create");
            setEditingProjectId(null);
            setProjectForm({ name: "", description: "", color: PROJECT_COLORS[0], icon: PROJECT_ICON_OPTIONS[0].value });
          }
        }}
        form={projectForm}
        setForm={setProjectForm}
        onSubmit={handleSaveProject}
        saving={saving}
        mode={projectDialogMode}
      />

      <ProjectAccessDialog
        open={projectAccessOpen}
        onOpenChange={setProjectAccessOpen}
        project={selectedProject}
        members={selectedProjectMembers}
        directoryUsers={directoryUsers}
        directoryLoading={directoryLoading}
        inviteForm={memberInviteForm}
        setInviteForm={setMemberInviteForm}
        onInvite={handleInviteProjectMember}
        onRoleChange={handleProjectMemberRoleChange}
        onRemove={handleRemoveProjectMember}
        saving={saving}
        currentUser={currentUser}
      />

      <SprintDialog
        open={sprintDialogOpen}
        onOpenChange={(open) => {
          setSprintDialogOpen(open);
          if (!open) {
            setSprintDialogMode("create");
            setEditingSprintId(null);
          }
        }}
        form={sprintForm}
        setForm={setSprintForm}
        onSubmit={handleSaveSprint}
        saving={saving}
        projects={activeProjects}
        mode={sprintDialogMode}
      />

      <StandupDigestModal
        open={standupModalOpen && !standupMinimized}
        minimized={standupModalOpen && standupMinimized}
        onOpenChange={(open) => {
          setStandupModalOpen(open);
          if (!open) setStandupMinimized(false);
        }}
        onMinimize={() => setStandupMinimized(true)}
        onRestore={() => setStandupMinimized(false)}
        digest={standupDigest}
        loading={standupLoading}
        onGenerate={generateStandupDigest}
        scopeLabel={selectedProject ? selectedProject.name : "All Projects"}
      />

      <ButtonStudyGroup
        selected={quickActionSelected}
        expandedId={quickActionHovered || quickActionSelected}
        onHoverChange={setQuickActionHovered}
        onSelect={handleQuickAction}
        className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6"
      />

      <ImageViewer viewer={imageViewer} setViewer={setImageViewer} pointerState={pointerState} />
    </div>
  );
}

function Sidebar({
  themeMode,
  page,
  onChangePage,
  notesScope,
  onChangeNotesScope,
  personalNotes,
  projectNotes,
  selectedNoteId,
  onSelectNote,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  collapsed,
  onToggleCollapse,
}) {
  const [notesOpen, setNotesOpen] = useState(page === "notes");
  const [personalNotesOpen, setPersonalNotesOpen] = useState(true);
  const [projectNotesOpen, setProjectNotesOpen] = useState(true);

  useEffect(() => {
    if (page === "notes") setNotesOpen(true);
  }, [page]);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen transition-[width] duration-300 xl:block",
        themeMode === "dark"
          ? "border-r border-[#343a42] bg-[#2a2a2a]"
          : "border-r border-[#e7e7ea] bg-[#fcfcfd]",
        collapsed ? "w-[80px]" : "w-[236px]",
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className={cn(themeMode === "dark" ? "border-b border-[#343a42] py-5" : "border-b border-[#ececf0] py-5", collapsed ? "px-4" : "px-4.5")}>
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f15a24] text-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            {!collapsed ? (
              <div>
                <p className={cn("text-[15px] font-semibold", themeMode === "dark" ? "text-[#f2f4f7]" : "text-[#23242a]")}>Tasklane Studio</p>
                <p className={cn("text-sm", themeMode === "dark" ? "text-[#9aa3af]" : "text-[#7b7c85]")}>Team Plan</p>
              </div>
            ) : null}
          </div>
        </div>

        <ScrollPanel className="flex-1">
          <div className={cn("space-y-3 py-2.5", collapsed ? "px-2.5" : "px-3")}>
            <div>
              {!collapsed ? (
                  <p className={cn("mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.16em]", themeMode === "dark" ? "text-[#8e97a3]" : "text-[#8f9098]")}>
                  Workspace
                </p>
              ) : null}
              <div className="space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  if (item.id === "notes") {
                    const active = page === "notes";
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          onClick={() => {
                            onChangeNotesScope(notesScope || "personal");
                            onChangePage("notes");
                            setNotesOpen((value) => (page === "notes" ? !value : true));
                          }}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "group flex w-full rounded-xl text-[13px] transition duration-200 hover:translate-x-[1px]",
                            collapsed
                              ? "justify-center px-3 py-2"
                              : "items-center gap-3 px-3 py-2 text-left",
                            active
                              ? themeMode === "dark"
                                ? "bg-[#3a3a3a] text-[#f2f4f7]"
                                : "bg-[#efeff1] text-[#23242a]"
                              : themeMode === "dark"
                                ? "text-[#b5beca] hover:bg-[#34373c]"
                                : "text-[#585961] hover:bg-[#f5f5f7]",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 transition group-hover:scale-110" />
                          {!collapsed ? (
                            <>
                              <span className="font-medium">{item.label}</span>
                              <ChevronDown className={cn("ml-auto h-4 w-4 transition", notesOpen && "rotate-180")} />
                            </>
                          ) : null}
                        </button>
                        {!collapsed && notesOpen ? (
                          <div className={cn("ml-4 space-y-1 pl-3", themeMode === "dark" ? "border-l border-[#343a42]" : "border-l border-[#ececf0]")}>
                            {/* <button
                              type="button"
                              onClick={() => {
                                onChangeNotesScope("personal");
                                onChangePage("notes");
                              }}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[13px] transition",
                                active && notesScope === "personal"
                                  ? "bg-[#f4f8ff] text-[#2160ff]"
                                  : "text-[#666872] hover:bg-[#f5f5f7]",
                              )}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                              <span>Personal Notes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onChangeNotesScope("project");
                                onChangePage("notes");
                              }}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[13px] transition",
                                active && notesScope === "project"
                                  ? "bg-[#f4f8ff] text-[#2160ff]"
                                  : "text-[#666872] hover:bg-[#f5f5f7]",
                              )}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                              <span>Project Notes</span>
                            </button> */}
                            <div className={cn("rounded-[16px] p-1.5", themeMode === "dark" ? "border border-[#3a4048] bg-[#303030]" : "border border-[#f0f1f4] bg-white/70")}>
                              <button
                                type="button"
                                onClick={() => {
                                  onChangeNotesScope("personal");
                                  onChangePage("notes");
                                  setPersonalNotesOpen((value) => !value);
                                }}
                                className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:translate-x-[1px]", themeMode === "dark" ? "text-[#8e97a3] hover:bg-[#3a3a3a]" : "text-[#9aa0ab] hover:bg-[#f5f5f7]")}
                              >
                                <span>Personal Notes</span>
                                <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition", personalNotesOpen && "rotate-180")} />
                              </button>
                              {personalNotesOpen ? (
                                <div className="mt-1 space-y-0.5">
                                  {personalNotes.length ? (
                                    personalNotes.slice(0, 8).map((note) => (
                                      <button
                                        key={note.$id}
                                        type="button"
                                        onClick={() => {
                                          onChangeNotesScope("personal");
                                          onSelectNote(note.$id);
                                          onChangePage("notes");
                                        }}
                                        className={cn(
                                          "flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[12px] transition hover:translate-x-[1px]",
                                          notesScope === "personal" && selectedNoteId === note.$id
                                            ? themeMode === "dark"
                                              ? "bg-[#4a3228] text-[#ff8a5f]"
                                              : "bg-[#fff4ef] text-[#f15a24]"
                                            : themeMode === "dark"
                                              ? "text-[#b5beca] hover:bg-[#3a3a3a]"
                                              : "text-[#666872] hover:bg-[#f5f5f7]",
                                        )}
                                      >
                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                        <span className="truncate">{note.title || "Untitled note"}</span>
                                      </button>
                                    ))
                                  ) : (
                                    <p className={cn("px-3 py-2 text-[12px]", themeMode === "dark" ? "text-[#8e97a3]" : "text-[#9aa0ab]")}>No personal notes</p>
                                  )}
                                </div>
                              ) : null}
                            </div>
                            <div className={cn("rounded-[16px] p-1.5", themeMode === "dark" ? "border border-[#3a4048] bg-[#303030]" : "border border-[#f0f1f4] bg-white/70")}>
                              <button
                                type="button"
                                onClick={() => {
                                  onChangeNotesScope("project");
                                  onChangePage("notes");
                                  setProjectNotesOpen((value) => !value);
                                }}
                                className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:translate-x-[1px]", themeMode === "dark" ? "text-[#8e97a3] hover:bg-[#3a3a3a]" : "text-[#9aa0ab] hover:bg-[#f5f5f7]")}
                              >
                                <span>Project Notes</span>
                                <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition", projectNotesOpen && "rotate-180")} />
                              </button>
                              {projectNotesOpen ? (
                                <div className="mt-1 space-y-0.5">
                                  {projectNotes.length ? (
                                    projectNotes.slice(0, 8).map((note) => (
                                      <button
                                        key={note.$id}
                                        type="button"
                                        onClick={() => {
                                          onChangeNotesScope("project");
                                          onSelectNote(note.$id);
                                          onChangePage("notes");
                                        }}
                                        className={cn(
                                          "flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[12px] transition hover:translate-x-[1px]",
                                          notesScope === "project" && selectedNoteId === note.$id
                                            ? themeMode === "dark"
                                              ? "bg-[#4a3228] text-[#ff8a5f]"
                                              : "bg-[#fff4ef] text-[#f15a24]"
                                            : themeMode === "dark"
                                              ? "text-[#b5beca] hover:bg-[#3a3a3a]"
                                              : "text-[#666872] hover:bg-[#f5f5f7]",
                                        )}
                                      >
                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                        <span className="truncate">{note.title || "Untitled note"}</span>
                                      </button>
                                    ))
                                  ) : (
                                    <p className={cn("px-3 py-2 text-[12px]", themeMode === "dark" ? "text-[#8e97a3]" : "text-[#9aa0ab]")}>No project notes</p>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                  const active = page === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onChangePage(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex w-full rounded-xl text-[13px] transition duration-200 hover:translate-x-[1px]",
                        collapsed
                          ? "justify-center px-3 py-2"
                          : "items-center gap-3 px-3 py-2 text-left",
                        active
                          ? themeMode === "dark"
                            ? "bg-[#3a3a3a] text-[#f2f4f7]"
                            : "bg-[#efeff1] text-[#23242a]"
                          : themeMode === "dark"
                            ? "text-[#b5beca] hover:bg-[#34373c]"
                            : "text-[#585961] hover:bg-[#f5f5f7]",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 transition group-hover:scale-110" />
                      {!collapsed ? <span className="font-medium">{item.label}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={cn("pt-4", themeMode === "dark" ? "border-t border-[#343a42]" : "border-t border-[#ececf0]")}>
              <div className={cn("mb-2 flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
                {!collapsed ? (
                  <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", themeMode === "dark" ? "text-[#8e97a3]" : "text-[#8f9098]")}>
                    Projects
                  </p>
                ) : null}
                <button
                  onClick={onCreateProject}
                  title="Create project"
                  className={cn("rounded-full p-1.5 transition", themeMode === "dark" ? "bg-[#353c48] text-[#8fb0ff] hover:bg-[#3e4754]" : "bg-[#edf2ff] text-[#2160ff] hover:bg-[#dfe8ff]")}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => onSelectProject("all")}
                  title={collapsed ? "All Projects" : undefined}
                  className={cn(
                    "flex w-full rounded-xl text-[13px] transition duration-200 hover:translate-x-[1px]",
                    collapsed ? "justify-center px-3 py-2" : "items-center gap-3 px-3 py-1.5 text-left",
                    activeProjectId === "all"
                      ? themeMode === "dark"
                        ? "bg-[#3a3a3a] text-[#f2f4f7]"
                        : "bg-[#efeff1] text-[#23242a]"
                      : themeMode === "dark"
                        ? "text-[#b5beca] hover:bg-[#34373c]"
                        : "text-[#585961] hover:bg-[#f5f5f7]",
                  )}
                >
                  <FolderOpen className="h-4 w-4" />
                  {!collapsed ? <span>All Projects</span> : null}
                </button>
                {projects.map((project) => (
                  (() => {
                    const ProjectIcon = getProjectIconComponent(project.icon);
                    return (
                      <button
                        key={project.$id}
                        onClick={() => onSelectProject(project.$id)}
                        title={collapsed ? project.name : undefined}
                        className={cn(
                          "flex w-full rounded-xl text-[13px] transition duration-200 hover:translate-x-[1px]",
                          collapsed ? "justify-center px-3 py-2" : "items-center gap-3 px-3 py-1.5 text-left",
                          activeProjectId === project.$id
                            ? themeMode === "dark"
                              ? "bg-[#3a3a3a] text-[#f2f4f7]"
                              : "bg-[#efeff1] text-[#23242a]"
                            : themeMode === "dark"
                              ? "text-[#b5beca] hover:bg-[#34373c]"
                              : "text-[#585961] hover:bg-[#f5f5f7]",
                        )}
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ backgroundColor: `${project.color || "#2160ff"}22`, color: project.color || "#2160ff" }}>
                          <ProjectIcon className="h-3.5 w-3.5" />
                        </div>
                        {!collapsed ? <span className="truncate">{project.name}</span> : null}
                      </button>
                    );
                  })()
                ))}
              </div>
            </div>
          </div>
        </ScrollPanel>

        <div className={cn(themeMode === "dark" ? "border-t border-[#343a42]" : "border-t border-[#ececf0]", collapsed ? "px-2.5 py-3.5" : "px-3 py-3.5")}>
          <Button
            variant="poster"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "w-full rounded-xl",
              collapsed ? "justify-center px-3 py-2.5" : "justify-between px-3 py-2.5",
            )}
          >
            {!collapsed ? <span className="text-[13px] font-medium">{collapsed ? "Expand" : "Collapse"}</span> : null}
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}

function TopBar({
  overdueTasks,
  themeMode,
  onToggleTheme,
  searchOpen,
  notificationsOpen,
  onSearchOpen,
  onNotificationOpen,
  searchRef,
  notificationRef,
  profileRef,
  searchResults,
  searchTerm,
  setSearchTerm,
  assigneeFilter,
  setAssigneeFilter,
  assigneeOptions,
  openTask,
  selectedProject,
  currentUser,
  profileOpen,
  onProfileOpen,
  onOpenProfilePage,
  onOpenFeedbackPage,
  canManageSelectedProject,
  onOpenEditProject,
  onOpenProjectAccess,
  onLogout,
}) {
  return (
    <header className={cn("sticky top-0 z-30 px-4 py-3 sm:px-5", themeMode === "dark" ? "border-b border-[#343a42] bg-[#303030]" : "border-b border-[#e7e7ea] bg-white")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={cn("text-xs uppercase tracking-[0.2em]", themeMode === "dark" ? "text-[#8e97a3]" : "text-[#8f9098]")}>Tasklane AI Tracker</p>
          <h1 className={cn("mt-1 text-lg font-semibold sm:text-[22px]", themeMode === "dark" ? "text-[#f2f4f7]" : "text-[#23242a]")}>
            {selectedProject ? selectedProject.name : "All Projects"}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden w-[210px] lg:block">
            <SelectField value={assigneeFilter} onValueChange={setAssigneeFilter} options={assigneeOptions} />
          </div>
          <button
            onClick={onToggleTheme}
            className={cn("flex h-10 items-center gap-2 rounded-xl px-3.5 text-[13px] transition duration-200", themeMode === "dark" ? "border border-[#3a4048] bg-[#383838] text-[#c6ccd5] hover:border-[#4a515b] hover:bg-[#404040]" : "border border-[#e6e7eb] bg-[#fafafa] text-[#62636b] hover:border-[#d9dde7] hover:bg-white")}
            title={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {themeMode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{themeMode === "dark" ? "Light" : "Dark"}</span>
          </button>
          <div ref={searchRef} className="relative">
            <button
              onClick={onSearchOpen}
              className={cn("flex h-10 items-center gap-2 rounded-xl px-3 text-[13px] transition duration-200", themeMode === "dark" ? "border border-[#3a4048] bg-[#383838] text-[#c6ccd5] hover:border-[#4a515b] hover:bg-[#404040]" : "border border-[#e6e7eb] bg-[#fafafa] text-[#62636b] hover:border-[#d9dde7] hover:bg-white")}
            >
              <Search className="h-4 w-4" />
              {/* <span>Search tasks...</span> */}
            </button>
            {searchOpen ? (
              <Card className="absolute right-0 top-12 z-40 w-[340px] p-2.5">
                <Input
                  className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f] placeholder:text-[#8f9098]"
                  placeholder="Search tasks by title or description"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <div className="mt-3 max-h-72 space-y-2 overflow-auto">
                  {searchResults.length === 0 ? (
                    <p className="px-2 py-3 text-[13px] text-[#8f9098]">No matching tasks yet.</p>
                  ) : (
                    searchResults.map((task) => (
                      <button
                        key={task.$id}
                        onClick={() => openTask(task.$id)}
                        className="w-full rounded-2xl border border-[#ececf0] bg-white p-2.5 text-left transition hover:bg-[#fafafa]"
                      >
                        <p className="font-semibold text-[#23242a]">{task.title}</p>
                        <p className="mt-1 line-clamp-2 text-[13px] text-[#7b7c85]">{task.description}</p>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            ) : null}
          </div>

          <div ref={notificationRef} className="relative">
            <button
              onClick={onNotificationOpen}
              className={cn("relative flex h-10 w-10 items-center justify-center rounded-xl transition duration-200", themeMode === "dark" ? "border border-[#3a4048] bg-[#383838] text-[#c6ccd5] hover:border-[#4a515b] hover:bg-[#404040]" : "border border-[#e6e7eb] bg-[#fafafa] text-[#62636b] hover:border-[#d9dde7] hover:bg-white")}
            >
              <CalendarDays className="h-4 w-4" />
              {overdueTasks.length > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#ff5252] animate-blink" />
              ) : null}
            </button>
            {notificationsOpen ? (
              <Card className="absolute right-0 top-12 z-40 w-[300px] p-2.5">
                <p className="text-[13px] font-semibold text-[#23242a]">Overdue tasks</p>
                <div className="mt-3 space-y-2">
                  {overdueTasks.length === 0 ? (
                    <p className="text-[13px] text-[#8f9098]">Nothing overdue.</p>
                  ) : (
                    overdueTasks.map((task) => (
                      <div key={task.$id} className="rounded-2xl border border-[#ffdede] bg-[#fff7f7] p-2.5">
                        <p className="font-semibold text-[#8e3535]">{task.title}</p>
                        <p className="mt-1 text-[13px] text-[#bf6666]">Due {formatDate(task.dueDate)}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            ) : null}
          </div>

          {selectedProject && canManageSelectedProject ? (
            <Button variant="outline" className={cn(themeMode === "dark" ? "border-[#3a4048] bg-[#383838] text-[#f2f4f7]" : "border-[#dfe0e5] bg-white text-[#23242a]")} onClick={onOpenEditProject}>
              <PencilLine className="h-4 w-4" />
              Edit Project
            </Button>
          ) : null}
          {selectedProject && canManageSelectedProject ? (
            <Button variant="outline" className={cn(themeMode === "dark" ? "border-[#3a4048] bg-[#383838] text-[#f2f4f7]" : "border-[#dfe0e5] bg-white text-[#23242a]")} onClick={onOpenProjectAccess}>
              <Users className="h-4 w-4" />
              Manage Access
            </Button>
          ) : null}
          <div ref={profileRef} className="relative">
            <button
              onClick={onProfileOpen}
              className={cn("flex h-11 w-11 items-center justify-center overflow-hidden rounded-full transition duration-200", themeMode === "dark" ? "border border-[#3a4048] bg-[#383838] hover:border-[#4a515b] hover:bg-[#404040]" : "border border-[#e6e7eb] bg-[#fafafa] hover:border-[#d9dde7] hover:bg-white")}
              title="Open profile"
            >
              <img src={PROFILE_AVATAR_URL} alt={currentUser?.name || "Profile"} className="h-full w-full object-cover" />
              <span className="absolute bottom-0.5 right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white bg-[#23242a] text-white">
                <GenderIcon gender={currentUser?.gender} className="h-2.5 w-2.5" />
              </span>
            </button>
            {profileOpen ? (
              <Card className="absolute right-0 top-14 z-40 w-[280px] p-0 overflow-hidden">
                <div className="border-b border-[#ececf0] bg-[linear-gradient(180deg,#ffffff,#fafbff)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-white/70">
                      <div className="relative h-full w-full">
                        <img src={PROFILE_AVATAR_URL} alt={currentUser?.name || "Profile"} className="h-full w-full object-cover" />
                        <span className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#23242a] text-white">
                          <GenderIcon gender={currentUser?.gender} className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#23242a]">{currentUser?.name || "User"}</p>
                      <p className="truncate text-sm text-[#8f9098]">{currentUser?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={onOpenProfilePage}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#4f535f] transition hover:bg-[#f6f7fb]"
                  >
                    <GenderIcon gender={currentUser?.gender} className="h-4 w-4 text-[#7b7c85]" />
                    <span className="font-medium text-[#23242a]">Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenFeedbackPage}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#4f535f] transition hover:bg-[#f6f7fb]"
                  >
                    <MessageSquare className="h-4 w-4 text-[#7b7c85]" />
                    <span className="font-medium text-[#23242a]">Feedback</span>
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#b44343] transition hover:bg-[#fff5f5]"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function AuthPage({ mode, setMode, form, setForm, onSubmit, loading, error }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f2,#f4f6fb)] px-4 py-8 text-[#23242a]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[36px] border border-[#eadfd8] bg-[radial-gradient(circle_at_20%_18%,rgba(255,206,181,0.42),transparent_24%),radial-gradient(circle_at_78%_16%,rgba(255,122,66,0.34),transparent_26%),linear-gradient(135deg,#fff6f1,#ffe1d2_42%,#ffd0b8)] p-8 shadow-[0_24px_70px_rgba(185,86,34,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9b5e44]">Tasklane AI Tracker</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#4a2411]">Private workspace for delivery, planning, and AI-powered updates.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#7f5d52]">
            Sign in to access your projects, sprints, analytics, and collaborative task workspace. This custom auth flow uses hashed passwords and function-issued sessions.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Projects" value="Scoped" />
            <MiniMetric label="Passwords" value="Hashed" />
            <MiniMetric label="Sessions" value="Function-based" />
          </div>
        </div>

        <Card className="mx-auto w-full max-w-[460px] p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f9098]">{mode === "signup" ? "Create account" : "Sign in"}</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#23242a]">{mode === "signup" ? "Join Tasklane" : "Welcome back"}</h2>
            <p className="mt-2 text-sm text-[#7b7c85]">
              {mode === "signup" ? "Create your first workspace owner account." : "Enter your credentials to continue."}
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === "signup" ? (
              <Field label="Name">
                <Input
                  className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                />
              </Field>
            ) : null}
            <Field label="Email">
              <Input
                className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="name@company.com"
              />
            </Field>
            <Field label="Password">
              <Input
                className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="At least 8 characters"
              />
            </Field>
            {error ? (
              <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
            ) : null}
            <Button className="w-full bg-[#2160ff] text-white hover:bg-[#184ed4]" type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between gap-3 text-sm">
            <span className="text-[#7b7c85]">
              {mode === "signup" ? "Already have an account?" : "Need an account?"}
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="font-semibold text-[#2160ff]"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MobileNav({
  themeMode,
  page,
  onChangePage,
  notesScope,
  onChangeNotesScope,
  onCreate,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
}) {
  return (
    <div className={cn("px-4 py-3 xl:hidden", themeMode === "dark" ? "border-b border-[#343a42] bg-[#303030]" : "border-b border-[#e7e7ea] bg-white")}>
      <div className="flex gap-2 overflow-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "notes") {
                  onChangeNotesScope(notesScope || "personal");
                }
                onChangePage(item.id);
              }}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm",
                active
                  ? themeMode === "dark"
                    ? "border-[#6a86c9] bg-[#353c48] text-[#9ab2ff]"
                    : "border-[#2160ff] bg-[#edf2ff] text-[#2160ff]"
                  : themeMode === "dark"
                    ? "border-[#3a4048] bg-[#383838] text-[#c6ccd5]"
                    : "border-[#e6e7eb] bg-white text-[#62636b]",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onSelectProject("all")}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm",
            activeProjectId === "all"
              ? themeMode === "dark"
                ? "border-[#6a86c9] bg-[#353c48] text-[#9ab2ff]"
                : "border-[#2160ff] bg-[#edf2ff] text-[#2160ff]"
              : themeMode === "dark"
                ? "border-[#3a4048] bg-[#383838] text-[#c6ccd5]"
                : "border-[#e6e7eb] bg-white text-[#62636b]",
          )}
        >
          All Projects
        </button>
        {projects.map((project) => (
          <button
            key={project.$id}
            onClick={() => onSelectProject(project.$id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm",
              activeProjectId === project.$id
                ? themeMode === "dark"
                  ? "border-[#6a86c9] bg-[#353c48] text-[#9ab2ff]"
                  : "border-[#2160ff] bg-[#edf2ff] text-[#2160ff]"
                : themeMode === "dark"
                  ? "border-[#3a4048] bg-[#383838] text-[#c6ccd5]"
                  : "border-[#e6e7eb] bg-white text-[#62636b]",
            )}
          >
            {project.name}
          </button>
        ))}
        <Button className="shrink-0 bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Task
        </Button>
        <button onClick={onCreateProject} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm", themeMode === "dark" ? "border-[#3a4048] bg-[#383838] text-[#c6ccd5]" : "border-[#e6e7eb] bg-white text-[#62636b]")}>
          + Project
        </button>
      </div>
    </div>
  );
}

function StandupDigestModal({
  open,
  minimized,
  onOpenChange,
  onMinimize,
  onRestore,
  digest,
  loading,
  onGenerate,
  scopeLabel,
}) {
  return (
    <>
      <DialogShell
        open={open}
        onOpenChange={onOpenChange}
        title="Standup digest"
        description="Today's blockers, progress, and next steps."
        headerActions={
          <button
            onClick={onMinimize}
            className="rounded-full border border-[#e5e5e9] p-2 text-[#7b7c85] transition hover:bg-[#fafafa]"
            title="Minimize"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Badge className="border-[#ececf0] bg-[#f5f5f7] text-[#62636b]">{scopeLabel}</Badge>
            <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onGenerate} disabled={loading}>
              {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Digest
            </Button>
          </div>
          <div className="min-h-[260px] rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-4">
            {digest ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-[#43454d]">{digest}</p>
            ) : (
              <EmptyStateWidget
                title="No digest yet"
                body="Generate a standup digest to summarize blockers, progress, and next steps from the current scope."
              />
            )}
          </div>
        </div>
      </DialogShell>

      {minimized ? (
        <Card className="testing-lab-google-frame fixed bottom-24 right-5 z-40 w-[320px] border-transparent hover:!border-transparent p-4 shadow-[0_22px_60px_rgba(15,23,42,0.18)] sm:bottom-28 sm:right-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#23242a]">Standup digest</p>
              <p className="mt-1 text-xs text-[#7b7c85]">{scopeLabel}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-[#e5e5e9] px-2.5 py-1.5 text-xs text-[#7b7c85] transition hover:bg-[#fafafa]"
              title="Close"
            >
              Close
            </button>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5d616b]">
            {digest || "Generate a standup digest to summarize blockers, progress, and next steps from the current scope."}
          </p>
          <div className="mt-4 flex gap-2">
            <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onRestore}>
              Open
            </Button>
            <Button variant="outline" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={onGenerate} disabled={loading}>
              {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Refresh
            </Button>
          </div>
        </Card>
      ) : null}
    </>
  );
}

function TaskEditor({
  open,
  onOpenChange,
  task,
  mode,
  taskComments,
  taskSubtasks,
  onSave,
  onRefresh,
  openImage,
  saving,
  setError,
  onDeleteTask,
  projects,
  sprints,
  auditEntries,
  selectedProjectId,
  actorName,
  actorUserId,
  directoryUsers,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [customLabel, setCustomLabel] = useState("");
  const [draftSubtasks, setDraftSubtasks] = useState([]);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentSaving, setCommentSaving] = useState(false);
  const [aiLoadingTarget, setAiLoadingTarget] = useState("");
  const [aiPreview, setAiPreview] = useState({ open: false, target: "", value: "" });
  const [aiError, setAiError] = useState("");

  const activeTaskId = task?.$id || "";

  function getDefaultSprintId(projectId) {
    if (!projectId) return "";
    const active = sprints.find((sprint) => sprint.projectId === projectId && sprint.status === "Active");
    return active?.$id || "";
  }

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && task) {
      setForm({
        projectId: task.projectId || "",
        sprintId: task.sprintId || "",
        assignedToUserId: task.assignedToUserId || "",
        assignedToName: task.assignedToName || "",
        title: task.title || "",
        description: task.description || "",
        status: task.status || "Backlog",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || "",
        estimateHours: minutesToHoursValue(getTaskEstimateMinutes(task)),
        actualHours: task.actualMinutes == null ? "" : minutesToHoursValue(getTaskActualMinutes(task)),
        labels: task.labels?.length ? [...task.labels] : ["DNI"],
        recurringEnabled: Boolean(task.recurringEnabled),
        recurringFrequency: task.recurringFrequency || "weekly",
        recurringInterval: task.recurringInterval || 1,
      });
      setDraftSubtasks([]);
    } else {
      const projectId = selectedProjectId || "";
      setForm({
        ...INITIAL_FORM,
        projectId,
        sprintId: getDefaultSprintId(projectId),
        assignedToUserId: actorUserId || "",
        assignedToName: actorName || "",
      });
      setDraftSubtasks([]);
    }
    setCustomLabel("");
    setSubtaskTitle("");
    setCommentText("");
    setCommentImage(null);
    setEditingCommentId(null);
    setAiLoadingTarget("");
    setAiPreview({ open: false, target: "", value: "" });
    setAiError("");
  }, [open, mode, task, selectedProjectId, actorUserId, actorName]);

  function toggleLabel(label) {
    setForm((current) => ({
      ...current,
      labels: current.labels.includes(label) ? current.labels.filter((item) => item !== label) : [...current.labels, label],
    }));
  }

  function addCustomLabel() {
    const value = customLabel.trim();
    if (!value) return;
    setForm((current) => ({
      ...current,
      labels: current.labels.includes(value) ? current.labels : [...current.labels, value],
    }));
    setCustomLabel("");
  }

  function createPersistedSubtask() {
    const title = subtaskTitle.trim();
    if (!title) return;
    if (activeTaskId) {
      createSubtask({
        taskId: activeTaskId,
        title,
        status: "Open",
        createdAt: new Date().toISOString(),
        createdBy: actorName,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
        isActive: true,
      })
        .then(async () => {
          setSubtaskTitle("");
          await onRefresh();
        })
        .catch((err) => setError(err.message || "Failed to add subtask."));
      return;
    }

    setDraftSubtasks((current) => [
      ...current,
      {
        $id: `draft-${Date.now()}-${current.length}`,
        title,
        status: "Open",
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: actorName,
      },
    ]);
    setSubtaskTitle("");
  }

  async function toggleSubtask(subtask) {
    const nextStatus = subtask.status === "Done" ? "Open" : "Done";
    if (subtask.$id?.startsWith("draft-")) {
      setDraftSubtasks((current) => current.map((item) => (item.$id === subtask.$id ? { ...item, status: nextStatus } : item)));
      return;
    }
    try {
      await updateSubtask(subtask.$id, {
        status: nextStatus,
        updatedByUserId: actorUserId,
      });
      await onRefresh();
    } catch (err) {
      setError(err.message || "Failed to update subtask.");
    }
  }

  async function deleteSubtask(subtask) {
    if (subtask.$id?.startsWith("draft-")) {
      setDraftSubtasks((current) => current.filter((item) => item.$id !== subtask.$id));
      return;
    }
    try {
      await updateSubtask(subtask.$id, {
        isActive: false,
        updatedByUserId: actorUserId,
      });
      await onRefresh();
    } catch (err) {
      setError(err.message || "Failed to delete subtask.");
    }
  }

  async function previewAi(action, text, target) {
    if (!text?.trim()) {
      setAiError("Add some text first.");
      return;
    }
    setAiError("");
    setAiLoadingTarget(target);
    try {
      const result = await runAiAction({
        action,
        text,
        task: task
          ? {
              title: task.title,
              description: task.description,
            }
          : undefined,
      });
      const previewValue = result?.output || result?.title || result?.text || "";
      if (!previewValue.trim()) {
        setAiError("AI returned an empty response.");
        return;
      }
      setAiPreview({ open: true, target, value: previewValue });
    } catch (err) {
      setAiError(err.message || "AI action failed.");
      setError(err.message || "AI action failed.");
    } finally {
      setAiLoadingTarget("");
    }
  }

  function applyAiPreview() {
    if (aiPreview.target === "description") {
      setForm((current) => ({ ...current, description: aiPreview.value }));
    } else if (aiPreview.target === "title") {
      setForm((current) => ({ ...current, title: aiPreview.value }));
    } else if (aiPreview.target === "comment") {
      setCommentText(aiPreview.value);
    }
    setAiPreview({ open: false, target: "", value: "" });
    setAiError("");
  }

  async function submitComment() {
    if (!activeTaskId) return;
    if (!commentText.trim() && !commentImage) {
      setError("Add a comment or image first.");
      return;
    }
    setCommentSaving(true);
    try {
      let imageUrl = "";
      if (commentImage) {
        imageUrl = await uploadCommentImage(commentImage);
      }
      if (editingCommentId) {
        await updateComment(editingCommentId, {
          commentText: commentText.trim(),
          imageUrl: imageUrl || taskComments.find((item) => item.$id === editingCommentId)?.imageUrl || "",
          updatedByUserId: actorUserId,
        });
      } else {
        await createComment({
          taskId: activeTaskId,
          commentText: commentText.trim() || "Image attachment",
          imageUrl,
          createdAt: new Date().toISOString(),
          createdBy: actorName,
          createdByUserId: actorUserId,
          updatedByUserId: actorUserId,
          isActive: true,
        });
      }
      setCommentText("");
      setCommentImage(null);
      setEditingCommentId(null);
      await onRefresh();
    } catch (err) {
      setError(err.message || "Failed to save comment.");
    } finally {
      setCommentSaving(false);
    }
  }

  async function softDeleteComment(comment) {
    try {
      await updateComment(comment.$id, {
        isActive: false,
        updatedByUserId: actorUserId,
      });
      if (editingCommentId === comment.$id) {
        setEditingCommentId(null);
        setCommentText("");
        setCommentImage(null);
      }
      await onRefresh();
    } catch (err) {
      setError(err.message || "Failed to delete comment.");
    }
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.projectId) {
      setError("Project is required.");
      return;
    }
    await onSave(form, draftSubtasks);
  }

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Task" : "Create Task"}
      description={mode === "edit" ? "Update task details, subtasks, comments, and AI assistance." : "Create a new task with project, sprint, labels, and subtasks."}
      wide
      headerActions={
        <div className="flex items-center gap-2">
          {mode === "edit" && task ? (
            <Button variant="outline" className="border-[#ffd7d7] bg-white text-[#b44343] hover:bg-[#fff5f5]" onClick={() => onDeleteTask(task)} disabled={saving}>
              Delete
            </Button>
          ) : null}
          <Button variant="outline" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={handleSave} disabled={saving}>
            {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Task
          </Button>
        </div>
      }
    >
      <ScrollPanel className="h-[calc(92vh-6.25rem)] pr-2">
        {aiError ? (
          <div className="mb-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {aiError}
          </div>
        ) : null}
        <div className="grid gap-5 pb-2 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Project">
                <SelectField
                  value={form.projectId}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      projectId: value,
                      sprintId: mode === "create" ? getDefaultSprintId(value) : current.sprintId,
                    }))
                  }
                  options={projects.map((project) => ({ value: project.$id, label: project.name }))}
                  placeholder="Select project"
                />
              </Field>
              <Field label="Sprint">
                <SelectField
                  value={form.sprintId || "__none__"}
                  onValueChange={(value) => setForm((current) => ({ ...current, sprintId: value === "__none__" ? "" : value }))}
                  options={[
                    { value: "__none__", label: "No sprint" },
                    ...sprints.filter((sprint) => !form.projectId || sprint.projectId === form.projectId).map((sprint) => ({ value: sprint.$id, label: sprint.name })),
                  ]}
                  placeholder="Select sprint"
                />
              </Field>
              <Field label="Assign to">
                <SelectField
                  value={form.assignedToUserId || "__unassigned__"}
                  onValueChange={(value) => {
                    const selectedUser = directoryUsers.find((user) => user.$id === value);
                    setForm((current) => ({
                      ...current,
                      assignedToUserId: value === "__unassigned__" ? "" : value,
                      assignedToName: value === "__unassigned__" ? "" : selectedUser?.name || selectedUser?.email || "",
                    }));
                  }}
                  options={[
                    { value: "__unassigned__", label: "Unassigned" },
                    ...directoryUsers.map((user) => ({
                      value: user.$id,
                      label: user.$id === actorUserId ? `${user.name || user.email} (Me)` : user.name || user.email,
                    })),
                  ]}
                  placeholder="Assign user"
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </Field>
              <Field label="Status">
                <SelectField value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))} options={STATUS_OPTIONS} />
              </Field>
            </div>

            <Field label="Description">
              <Textarea className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm" className="bg-[#edf2ff] text-[#2160ff]" onClick={() => previewAi("enhance_description", form.description, "description")} type="button">
                  {aiLoadingTarget === "description" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Enhance Description
                </Button>
                <Button variant="outline" size="sm" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => previewAi("generate_title", form.description || form.title, "title")} type="button">
                  {aiLoadingTarget === "title" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                  Generate Title
                </Button>
              </div>
            </Field>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Priority">
                <SelectField value={form.priority} onValueChange={(value) => setForm((current) => ({ ...current, priority: value }))} options={PRIORITY_OPTIONS} />
              </Field>
              <Field label="Due date">
                <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </Field>
              <Field label="Estimate hours" hint="Decimals allowed">
                <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" type="number" min="0" step="0.1" value={form.estimateHours} onChange={(event) => setForm((current) => ({ ...current, estimateHours: event.target.value }))} />
              </Field>
              <Field label="Actual hours" hint="0.5h = 30m">
                <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" type="number" min="0" step="0.1" value={form.actualHours} onChange={(event) => setForm((current) => ({ ...current, actualHours: event.target.value }))} />
              </Field>
            </div>

            <Field label="Labels" hint="DNI included by default">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {Array.from(new Set([...DEFAULT_LABELS, ...form.labels])).map((label) => (
                  <CheckboxRow key={label} checked={form.labels.includes(label)} onCheckedChange={() => toggleLabel(label)} label={label} />
                ))}
              </div>
              <div className="flex gap-3">
                <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} placeholder="Add custom label" />
                <Button variant="outline" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={addCustomLabel}>
                  Add
                </Button>
              </div>
            </Field>

            <Card className="border border-[#e8e8ec] bg-white p-4">
              <div className="grid gap-4 md:grid-cols-[auto_1fr_120px]">
                <CheckboxRow checked={form.recurringEnabled} onCheckedChange={() => setForm((current) => ({ ...current, recurringEnabled: !current.recurringEnabled }))} label="Recurring task" />
                <Field label="Frequency">
                  <SelectField value={form.recurringFrequency} onValueChange={(value) => setForm((current) => ({ ...current, recurringFrequency: value }))} options={RECURRING_OPTIONS} />
                </Field>
                <Field label="Interval">
                  <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" type="number" min="1" value={form.recurringInterval} onChange={(event) => setForm((current) => ({ ...current, recurringInterval: event.target.value }))} />
                </Field>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="border border-[#e8e8ec] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg text-slate-900 font-semibold">Subtasks</p>
                  {/* <p className="text-sm text-slate-400">Dedicated Appwrite table with soft delete support.</p> */}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} placeholder="Add subtask" />
                <Button variant="outline" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={createPersistedSubtask}>
                  Add
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {(activeTaskId ? taskSubtasks : draftSubtasks)
                  .filter((item) => item.isActive !== false)
                  .map((subtask) => (
                    <div key={subtask.$id || subtask.createdAt} className="flex items-center justify-between gap-3 rounded-2xl border border-[#ececf0] bg-[#fafafa] p-3">
                      <button onClick={() => toggleSubtask(subtask)} className="min-w-0 flex-1 text-left">
                        <p className={cn("font-medium text-[#23242a]", subtask.status === "Done" && "text-[#8c8d94] line-through")}>{subtask.title}</p>
                        <p className="text-xs text-[#8f9098]">{subtask.status}</p>
                      </button>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" className="bg-[#edf2ff] text-[#2160ff]" onClick={() => toggleSubtask(subtask)}>
                          {subtask.status === "Done" ? "Open" : "Done"}
                        </Button>
                        <Button variant="danger" size="icon" onClick={() => deleteSubtask(subtask)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {mode === "edit" && task ? (
              <CommentsPanel
                comments={taskComments}
                commentText={commentText}
                setCommentText={setCommentText}
                commentImage={commentImage}
                setCommentImage={setCommentImage}
                editingCommentId={editingCommentId}
                setEditingCommentId={setEditingCommentId}
                onEnhance={(text) => previewAi("enhance_comment", text, "comment")}
                onSubmit={submitComment}
                onDelete={softDeleteComment}
                openImage={openImage}
                commentSaving={commentSaving}
                aiLoadingTarget={aiLoadingTarget}
              />
            ) : (
              <Card className="border border-[#e8e8ec] bg-white p-5">
                <p className="font-semibold text-[#23242a]">Comments unlock after first save</p>
                <p className="mt-2 text-sm text-[#7b7c85]">Save the task once to start threaded collaboration and image uploads.</p>
              </Card>
            )}

            {mode === "edit" && task ? <AuditTimeline entries={auditEntries} /> : null}
          </div>
        </div>
      </ScrollPanel>

      {aiPreview.open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[26px] border border-[#e8e8ec] bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[#23242a]">AI Preview</p>
                <p className="mt-1 text-[13px] text-[#7b7c85]">Review the generated text before applying it.</p>
              </div>
              <button
                className="rounded-full border border-[#e5e5e9] p-2 text-[#7b7c85] transition hover:bg-[#fafafa]"
                onClick={() => setAiPreview({ open: false, target: "", value: "" })}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Textarea className="min-h-[240px] border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" readOnly value={aiPreview.value} />
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => setAiPreview({ open: false, target: "", value: "" })} type="button">
                Cancel
              </Button>
              <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={applyAiPreview} type="button">
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DialogShell>
  );
}

function CommentsPanel({
  comments,
  commentText,
  setCommentText,
  commentImage,
  setCommentImage,
  editingCommentId,
  setEditingCommentId,
  onEnhance,
  onSubmit,
  onDelete,
  openImage,
  commentSaving,
  aiLoadingTarget,
}) {
  const fileInputRef = useRef(null);

  function onPaste(event) {
    const file = [...(event.clipboardData?.items || [])]
      .map((item) => item.getAsFile?.())
      .find((candidate) => candidate && candidate.type.startsWith("image/"));
    if (file) setCommentImage(file);
  }

  return (
    <Card className="border border-[#e8e8ec] bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-[#23242a]">Comments</p>
          {/* <p className="text-sm text-[#7b7c85]">
            Paste, drag, or upload images. Deletes are soft via `isActive=false`.
          </p> */}
        </div>
      </div>
      <div
        className="mt-4 rounded-[24px] border border-dashed border-[#dfe0e5] bg-[#fafafa] p-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file?.type.startsWith("image/")) setCommentImage(file);
        }}
      >
        <Textarea
          className="min-h-[110px] border-[#e5e5e9] bg-white text-[#1f1f1f]"
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          onPaste={onPaste}
          placeholder="Add a comment or paste an image with Ctrl+V"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" className="bg-[#edf2ff] text-[#2160ff]" onClick={() => onEnhance(commentText)} type="button">
            {aiLoadingTarget === "comment" ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Enhance Comment
          </Button>
          <Button variant="outline" size="sm" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => fileInputRef.current?.click()} type="button">
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
          {commentImage ? <span className="text-xs text-[#8f9098]">{commentImage.name}</span> : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setCommentImage(event.target.files?.[0] || null)}
          />
        </div>
        <div className="mt-3 flex gap-3">
          <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onSubmit} disabled={commentSaving}>
            {commentSaving ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageSquare className="mr-2 h-4 w-4" />
            )}
            {editingCommentId ? "Update Comment" : "Add Comment"}
          </Button>
          {editingCommentId ? (
            <Button
              variant="outline"
              className="border-[#dfe0e5] bg-white text-[#23242a]"
              onClick={() => {
                setEditingCommentId(null);
                setCommentText("");
                setCommentImage(null);
              }}
            >
              Cancel Edit
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {comments.map((comment) => (
          <Card key={comment.$id} className="border border-[#ececf0] bg-[#fafafa] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#23242a]">{comment.createdBy || "Tasklane User"}</p>
                <p className="text-xs text-[#8f9098]">{formatDateTime(comment.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-[#edf2ff] text-[#2160ff]"
                  onClick={() => {
                    setEditingCommentId(comment.$id);
                    setCommentText(comment.commentText);
                    setCommentImage(null);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" size="icon" onClick={() => onDelete(comment)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[#44464e]">{comment.commentText}</p>
            {comment.imageUrl ? (
              <button className="mt-3 overflow-hidden rounded-2xl border border-[#e8e8ec]" onClick={() => openImage(comment.imageUrl)}>
                <img src={comment.imageUrl} alt="Comment attachment" className="max-h-56 w-full object-cover" />
              </button>
            ) : null}
          </Card>
        ))}
      </div>
    </Card>
  );
}

function SprintDialog({ open, onOpenChange, form, setForm, onSubmit, saving, projects, mode }) {
  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Sprint" : "Create Sprint"}
      description={mode === "edit" ? "Update sprint details, dates, and lifecycle." : "Create a sprint with goal, dates, and project scope."}
    >
      <div className="space-y-4">
        <Field label="Project">
          <SelectField
            value={form.projectId}
            onValueChange={(value) => setForm({ ...form, projectId: value })}
            options={projects.map((project) => ({ value: project.$id, label: project.name }))}
            placeholder="Select project"
          />
        </Field>
        <Field label="Sprint name">
          <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </Field>
        <Field label="Sprint goal">
          <Textarea className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Start date">
            <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
          </Field>
          <Field label="End date">
            <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          </Field>
        </div>
        {mode === "edit" ? (
          <Field label="Sprint status">
            <SelectField
              value={form.status || "Planning"}
              onValueChange={(value) => setForm({ ...form, status: value })}
              options={SPRINT_STATUS_OPTIONS}
            />
          </Field>
        ) : null}
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onSubmit} disabled={saving}>
            {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "edit" ? "Save Sprint" : "Create Sprint"}
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}

function ProjectDialog({ open, onOpenChange, form, setForm, onSubmit, saving, mode }) {
  const SelectedProjectIcon = getProjectIconComponent(form.icon);
  const projectColor = form.color || PROJECT_COLORS[0];

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Project" : "Create Project"}
      description={mode === "edit" ? "Update the project details, color, and icon." : "Add a project and scope the board by it."}
      wide
    >
      <div className="flex h-[calc(86vh-5.5rem)] min-h-0 flex-col">
        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-h-0 overflow-y-auto pr-1">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#ececf0] bg-[linear-gradient(180deg,#ffffff,#fafbff)] p-2">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] border border-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                    style={{ background: `linear-gradient(145deg, ${projectColor}24, ${projectColor}0a)`, color: projectColor }}
                  >
                    <SelectedProjectIcon className="h-8 w-8 " />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f9098]">Live preview</p> */}
                    <h3 className="truncate text-xl mx-auto font-semibold text-[#23242a]">
                      {form.name?.trim() || "Untitled project"}
                    </h3>
                    {/* <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#666872]">
                      {form.description?.trim() || "Add a short description so the project is easier to identify across the workspace."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="border-[#ececf0] bg-white text-[#5f6169]">Sidebar icon ready</Badge>
                      <Badge className="border-[#ececf0] bg-white text-[#5f6169]">Collapsed view friendly</Badge>
                    </div> */}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#ececf0] bg-white p-5">
                {/* <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f9098]">Basics</p>
                  <h4 className="mt-1 text-lg font-semibold text-[#23242a]">Project details</h4>
                </div> */}
                <div className="space-y-4">
                  <Field label="Project name" hint="Shown across the app">
                    <Input
                      className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                    />
                  </Field>
                  <Field label="Description" hint="Keep it short and clear">
                    <Textarea
                      className="min-h-[160px] border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]"
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto pl-1">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#ececf0] bg-white p-5">
                {/* <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f9098]">Branding</p>
                  <h4 className="mt-1 text-lg font-semibold text-[#23242a]">Color & icon</h4>
                </div> */}

                <Field label="Project color" >
                  <div className="flex flex-wrap gap-3">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, color })}
                        className={cn(
                          "relative h-11 w-11 rounded-full border-4 transition",
                          form.color === color ? "border-[#1f1f1f] scale-[1.03]" : "border-transparent hover:scale-[1.02]",
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {form.color === color ? <span className="absolute inset-0 rounded-full ring-2 ring-white/70" /> : null}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="mt-5">
                  <Field label="Project icon">
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {PROJECT_ICON_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const selected = form.icon === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setForm({ ...form, icon: option.value })}
                            className={cn(
                              "flex min-w-0 flex-col items-center gap-2 rounded-[18px] border px-2 py-3 text-center transition",
                              selected
                                ? "border-[#23242a] bg-[#f5f5f7] text-[#23242a] shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                                : "border-[#e5e5e9] bg-white text-[#666872] hover:border-[#cfd4df] hover:bg-[#fafafa]",
                            )}
                          >
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full"
                              style={{ backgroundColor: `${projectColor}22`, color: projectColor }}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="truncate text-[10px] font-medium leading-tight">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#ececf0] bg-[linear-gradient(180deg,#ffffff,#f8f9fc)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f9098]">Tips</p>
                <div className="text-sm leading-1 text-[#666872]">
                  <p className="mt-3">1. Choose an icon that stays recognizable in collapsed sidebar mode.</p>
                  <p>2. Use a distinct project color so sprint, notes, and board context remain easy to scan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex shrink-0 justify-end gap-3 border-t border-[#ececf0] pt-4">
          <Button variant="outline" className="border-[#dfe0e5] bg-white text-[#23242a]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onSubmit} disabled={saving}>
            {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "edit" ? "Save Project" : "Create Project"}
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}

function ProjectAccessDialog({
  open,
  onOpenChange,
  project,
  members,
  directoryUsers,
  directoryLoading,
  inviteForm,
  setInviteForm,
  onInvite,
  onRoleChange,
  onRemove,
  saving,
  currentUser,
}) {
  const userLookup = useMemo(
    () => new Map(directoryUsers.map((user) => [user.$id, user])),
    [directoryUsers],
  );

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={project ? `${project.name} Access` : "Project Access"}
      description="Add existing users to this project and control what they can do."
    >
      {!project ? (
        <p className="text-sm text-[#7b7c85]">Select a project to manage access.</p>
      ) : (
        <div className="space-y-5">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#fff1ea] p-2 text-[#f15a24]">
                <UserPlus className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#23242a]">Add collaborator</p>
                <p className="mt-1 text-sm text-[#7b7c85]">They need an existing Tasklane account before you can add them.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px_auto]">
              <Field label="User email">
                <Input
                  className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]"
                  value={inviteForm.email}
                  onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="name@company.com"
                />
              </Field>
              <Field label="Role">
                <SelectField
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm((current) => ({ ...current, role: value }))}
                  options={PROJECT_MEMBER_ROLE_OPTIONS}
                />
              </Field>
              <div className="flex items-end">
                <Button className="w-full bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onInvite} disabled={saving || directoryLoading}>
                  {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add Member
                </Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[#ececf0] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#23242a]">Project members</p>
                  <p className="mt-1 text-sm text-[#7b7c85]">{members.length} active collaborators in this project.</p>
                </div>
                {directoryLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-[#2160ff]" /> : null}
              </div>
            </div>
            <div className="divide-y divide-[#eef0f5]">
              {members.length === 0 ? (
                <div className="px-5 py-8 text-sm text-[#7b7c85]">No members yet. Add someone by email to start collaborating.</div>
              ) : (
                members.map((member) => {
                  const user = userLookup.get(member.userId);
                  const isSelf = member.userId === currentUser?.$id;
                  return (
                    <div key={member.$id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#23242a]">{user?.name || "Workspace user"}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#7b7c85]">
                          <span>{user?.email || member.userId}</span>
                          {isSelf ? <Badge className="border-[#dfe7ff] bg-[#eef4ff] text-[#2160ff]">You</Badge> : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-[170px]">
                          <SelectField
                            value={member.role}
                            onValueChange={(value) => onRoleChange(member, value)}
                            options={PROJECT_MEMBER_ROLE_OPTIONS}
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="border-[#ffd7d7] bg-white text-[#b44343] hover:bg-[#fff5f5]"
                          onClick={() => onRemove(member)}
                          disabled={saving || (member.role === "Owner" && isSelf)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
    </DialogShell>
  );
}

function ImageViewer({ viewer, setViewer, pointerState }) {
  if (!viewer.open) return null;

  function updateTransform(next) {
    setViewer((state) => ({ ...state, ...next }));
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/95">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" onClick={() => updateTransform({ zoom: Math.min(viewer.zoom + 0.2, 4) })}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => updateTransform({ zoom: Math.max(viewer.zoom - 0.2, 0.6) })}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setViewer({ open: false, url: "", zoom: 1, x: 0, y: 0 })}>
            Close
          </Button>
        </div>
        <div
          className="relative flex-1 overflow-hidden"
          onWheel={(event) => {
            if (!event.ctrlKey) return;
            event.preventDefault();
            const delta = event.deltaY > 0 ? -0.1 : 0.1;
            updateTransform({ zoom: Math.max(0.6, Math.min(viewer.zoom + delta, 5)) });
          }}
          onMouseDown={(event) => {
            if (!event.ctrlKey) return;
            pointerState.current = {
              dragging: true,
              startX: event.clientX,
              startY: event.clientY,
              originX: viewer.x,
              originY: viewer.y,
            };
          }}
          onMouseMove={(event) => {
            if (!pointerState.current.dragging) return;
            updateTransform({
              x: pointerState.current.originX + (event.clientX - pointerState.current.startX),
              y: pointerState.current.originY + (event.clientY - pointerState.current.startY),
            });
          }}
          onMouseUp={() => {
            pointerState.current.dragging = false;
          }}
          onMouseLeave={() => {
            pointerState.current.dragging = false;
          }}
        >
          <img
            src={viewer.url}
            alt="Attachment"
            className="absolute left-1/2 top-1/2 max-h-none max-w-none select-none"
            style={{
              transform: `translate(-50%, -50%) translate(${viewer.x}px, ${viewer.y}px) scale(${viewer.zoom})`,
              cursor: "grab",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone = "default" }) {
  const toneClass =
    tone === "emerald"
      ? "bg-[#effaf3] text-[#2f8f2f]"
      : tone === "sky"
        ? "bg-[#eef4ff] text-[#2160ff]"
        : tone === "rose"
          ? "bg-[#fff2f4] text-[#d94f70]"
          : "bg-[#f1f4ff] text-[#2160ff]";

  return (
    <div className="rounded-[18px] border border-[#ececf0] bg-[#fafafa] p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7b7c85]">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-[28px] font-semibold text-[#23242a]">{value}</p>
    </div>
  );
}
