import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api, { aiMessage, apiMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import ErrorMessage from "../components/ErrorMessage";
import VoiceTaskInput from "../components/VoiceTaskInput";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();

  const [params, setParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");

  const query = {
    search: params.get("search") || "",
    status: params.get("status") || "",
    priority: params.get("priority") || "",
    sort: params.get("sort") || "-createdAt",
    page: params.get("page") || "1",
    limit: "6",
  };

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [taskResponse, statsResponse] = await Promise.all([
        api.get("/tasks", {
          params: query,
        }),
        api.get("/tasks/stats"),
      ]);

      setTasks(taskResponse.data.tasks);
      setPagination(taskResponse.data.pagination);
      setStats(statsResponse.data);
    } catch (err) {
      setError(apiMessage(err, "Unable to load tasks."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const refreshAfterAssistantAction = () => load();
    window.addEventListener("taskflow:tasks-changed", refreshAfterAssistantAction);
    load();

    return () => window.removeEventListener("taskflow:tasks-changed", refreshAfterAssistantAction);
  }, [params.toString()]);

  const updateQuery = (key, value) => {
    const next = new URLSearchParams(params);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    next.set("page", "1");

    setParams(next);
  };

  const save = async (data) => {
    try {
      if (modal.task) {
        await api.patch(`/tasks/${modal.task._id}`, data);
      } else {
        await api.post("/tasks", data);
      }

      setModal(null);

      setNotice(
        modal.task
          ? "Task updated."
          : "Task created."
      );

      load();
    } catch (err) {
      setError(apiMessage(err, "Unable to save task."));
    }
  };

  const remove = async (task) => {
    if (!window.confirm(`Delete “${task.title}”?`)) {
      return;
    }

    try {
      await api.delete(`/tasks/${task._id}`);

      setNotice("Task deleted.");

      load();
    } catch (err) {
      setError(apiMessage(err, "Unable to delete task."));
    }
  };

  const count = (status) => {
    return (
      stats.find((item) => item._id === status)?.count || 0
    );
  };

  const handleVoiceCommand = async (command) => {
    if (typeof command !== "string" || !command.trim()) {
      return false;
    }

    try {
      const response = await api.post("/ai/chat", { message: command });
      const result = response.data;

      if (!result.success) {
        setNotice("");
        setError(aiMessage({ response: { data: result } }));
        return false;
      }

      if (["task_created", "task_updated", "task_deleted"].includes(result.action)) {
        setNotice(result.message || "Task updated.");
        load();
      } else if (result.action === "tasks_listed") {
        const summary = result.tasks?.length
          ? result.tasks.map((task) => `${task.title} (${task.priority}, ${task.status}${task.dueDate ? `, due ${new Date(task.dueDate).toLocaleDateString()}` : ""})`).join("; ")
          : "No tasks found.";
        setNotice(`Your tasks: ${summary}`);
      } else {
        setNotice(result.message || "The assistant completed your request.");
      }
    } catch (err) {
      setNotice("");
      setError(aiMessage(err));
      return false;
    }
    return true;
  };

  return (
    <PageLayout>
      {/* ================= HEADER ================= */}

      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>

          <h1>
            Good morning, {user?.name?.split(" ")[0]}.
          </h1>

          <p>
            Here is what is happening with your work today.
          </p>

          {/* VOICE TASK BUTTON */}
          <VoiceTaskInput
            onStartListening={() => {
              setNotice("");
              setError("");
            }}
            onCommand={handleVoiceCommand}
          />
        </div>

        <button
          className="button primary"
          onClick={() => setModal({ task: null })}
        >
          ＋ New task
        </button>
      </div>

      {/* ================= STATISTICS ================= */}

      <div className="stats-grid">
        <StatCard
          label="Total tasks"
          value={pagination.total}
          icon="○"
        />

        <StatCard
          label="To do"
          value={count("todo")}
          icon="◷"
          tone="amber"
        />

        <StatCard
          label="In progress"
          value={count("in-progress")}
          icon="↗"
          tone="blue"
        />

        <StatCard
          label="Completed"
          value={count("done")}
          icon="✓"
          tone="green"
        />
      </div>

      {/* ================= TASK SECTION ================= */}

      <section
        className="content-section"
        id="tasks"
      >
        <div className="section-heading">
          <div>
            <h2>My tasks</h2>

            <p>
              Keep your priorities moving forward.
            </p>
          </div>

          <button
            className="button secondary"
            onClick={() => setModal({ task: null })}
          >
            ＋ Add task
          </button>
        </div>

        {/* ERROR */}

        <ErrorMessage
          message={error}
          onRetry={load}
        />

        {/* SUCCESS MESSAGE */}

        {notice && (
          <div className="alert alert-success">
            {notice}

            <button
              className="dismiss"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </div>
        )}

        {/* ================= FILTERS ================= */}

        <div className="filters">
          <input
            value={query.search}
            onChange={(e) =>
              updateQuery(
                "search",
                e.target.value
              )
            }
            placeholder="Search tasks..."
            aria-label="Search tasks"
          />

          <select
            value={query.status}
            onChange={(e) =>
              updateQuery(
                "status",
                e.target.value
              )
            }
          >
            <option value="">
              All statuses
            </option>

            <option value="todo">
              To do
            </option>

            <option value="in-progress">
              In progress
            </option>

            <option value="done">
              Completed
            </option>
          </select>

          <select
            value={query.priority}
            onChange={(e) =>
              updateQuery(
                "priority",
                e.target.value
              )
            }
          >
            <option value="">
              All priorities
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>
          </select>

          <select
            value={query.sort}
            onChange={(e) =>
              updateQuery(
                "sort",
                e.target.value
              )
            }
          >
            <option value="-createdAt">
              Newest
            </option>

            <option value="createdAt">
              Oldest
            </option>

            <option value="priority">
              Priority
            </option>

            <option value="dueDate">
              Due date
            </option>
          </select>
        </div>

        {/* ================= TASK LIST ================= */}

        <TaskList
          tasks={tasks}
          loading={loading}
          onDelete={remove}
          onEdit={(task) =>
            setModal({ task })
          }
          onCreate={() =>
            setModal({ task: null })
          }
        />

        {/* ================= PAGINATION ================= */}

        {pagination.pages > 1 && (
          <Pagination
            pagination={pagination}
            onPage={(page) =>
              updateQuery(
                "page",
                String(page)
              )
            }
          />
        )}
      </section>

      {/* ================= TASK MODAL ================= */}

      {modal && (
        <Modal
          title={
            modal.task
              ? "Edit task"
              : "Create a task"
          }
          onClose={() =>
            setModal(null)
          }
        >
          <TaskForm
            task={modal.task}
            onSubmit={save}
            onCancel={() =>
              setModal(null)
            }
            saving={false}
          />
        </Modal>
      )}
    </PageLayout>
  );
}

/* ================================================= */
/* STAT CARD */
/* ================================================= */

export function StatCard({
  label,
  value,
  icon,
  tone = "default",
}) {
  return (
    <div className="stat-card">
      <span
        className={`stat-icon ${tone}`}
      >
        {icon}
      </span>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* ================================================= */
/* PAGINATION */
/* ================================================= */

export function Pagination({
  pagination,
  onPage,
}) {
  return (
    <div className="pagination">
      <button
        disabled={pagination.page <= 1}
        onClick={() =>
          onPage(
            pagination.page - 1
          )
        }
      >
        ← Previous
      </button>

      <span>
        Page {pagination.page} of{" "}
        {pagination.pages}
      </span>

      <button
        disabled={
          pagination.page >=
          pagination.pages
        }
        onClick={() =>
          onPage(
            pagination.page + 1
          )
        }
      >
        Next →
      </button>
    </div>
  );
}

/* ================================================= */
/* PAGE LAYOUT */
/* ================================================= */

export function PageLayout({
  children,
}) {
  return (
    <div className="app-layout">
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      <main className="main-area">
        <Navbar
          onMenu={() =>
            document
              .querySelector(".sidebar")
              ?.classList.toggle(
                "open"
              )
          }
        />

        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}

/* ================================================= */
/* MODAL */
/* ================================================= */

export function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) =>
        e.target ===
          e.currentTarget &&
        onClose()
      }
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-heading">
          <h2>{title}</h2>

          <button
            className="close-modal"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}