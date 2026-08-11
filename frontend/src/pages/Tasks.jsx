import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadTasks = async () => {
    try {
      setError("");

      const response = await api.get("/tasks/");
      setTasks(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks/");

        if (!cancelled) {
          setTasks(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Failed to load tasks."
          );
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post("/tasks/", {
        title: title.trim(),
        description: description.trim() || null,
        completed: false,
      });

      setTitle("");
      setDescription("");

      await loadTasks();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create task."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      setUpdatingId(task.id);
      setError("");

      await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        completed: !task.completed,
      });

      await loadTasks();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to update task."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setDeletingId(taskId);
      setError("");

      await api.delete(`/tasks/${taskId}`);

      await loadTasks();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete task."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-header">
        <h1>Tasks</h1>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>Tasks</h1>

        <p>
          Create, manage and track your tasks.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {/* Create Task */}
      <section className="task-create-card">
        <div className="task-section-header">
          <div>
            <h2>Create Task</h2>

            <p>
              Add something you want to get done.
            </p>
          </div>
        </div>

        <form
          className="task-create-form"
          onSubmit={handleCreateTask}
        >
          <div className="task-field">
            <label htmlFor="task-title">
              Title
            </label>

            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Finish SmartDesk backend"
              disabled={creating}
            />
          </div>

          <div className="task-field">
            <label htmlFor="task-description">
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Add some details about this task..."
              rows={3}
              disabled={creating}
            />
          </div>

          <button
            className="task-create-button"
            type="submit"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Add Task"}
          </button>
        </form>
      </section>

      {/* Tasks */}
      <section className="tasks-section">
        <div className="tasks-section-header">
          <div>
            <h2>Your Tasks</h2>

            <p>
              {tasks.length === 0
                ? "You don't have any tasks yet."
                : `${tasks.length} ${
                    tasks.length === 1
                      ? "task"
                      : "tasks"
                  } in your workspace.`}
            </p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>

            <p>
              Create your first task above to start
              tracking your productivity.
            </p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map((task) => (
              <article
                key={task.id}
                className={`task-card ${
                  task.completed
                    ? "completed"
                    : ""
                }`}
              >
                <div className="task-info">
                  <div className="task-title-row">
                    <h3>{task.title}</h3>

                    <span
                      className={`task-status ${
                        task.completed
                          ? "task-status-completed"
                          : "task-status-pending"
                      }`}
                    >
                      {task.completed
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </div>

                  {task.description && (
                    <p>{task.description}</p>
                  )}
                </div>

                <div className="task-actions">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleTask(task)
                    }
                    disabled={
                      updatingId === task.id
                    }
                  >
                    {updatingId === task.id
                      ? "Updating..."
                      : task.completed
                        ? "Mark Pending"
                        : "Mark Complete"}
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      handleDeleteTask(task.id)
                    }
                    disabled={
                      deletingId === task.id
                    }
                  >
                    {deletingId === task.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}