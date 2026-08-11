import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      try {
        setError("");

        const response = await api.get("/tasks/");

        if (!cancelled) {
          setTasks(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Unable to load task statistics."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTasks(false);
        }
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const statistics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => task.completed
    ).length;
    const pending = total - completed;

    const percentage =
      total === 0
        ? 0
        : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      pending,
      percentage,
    };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks].slice(0, 5);
  }, [tasks]);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>
            Welcome back, {user?.name || "User"}
          </h1>

          <p>
            Here's an overview of your SmartDesk workspace.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-label">
            Total Tasks
          </div>

          <div className="stat-card-value">
            {loadingTasks ? "..." : statistics.total}
          </div>

          <div className="stat-card-description">
            All your tasks
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Pending
          </div>

          <div className="stat-card-value">
            {loadingTasks ? "..." : statistics.pending}
          </div>

          <div className="stat-card-description">
            Tasks still to complete
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Completed
          </div>

          <div className="stat-card-value">
            {loadingTasks ? "..." : statistics.completed}
          </div>

          <div className="stat-card-description">
            Finished tasks
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Progress
          </div>

          <div className="stat-card-value">
            {loadingTasks
              ? "..."
              : `${statistics.percentage}%`}
          </div>

          <div className="stat-card-description">
            Task completion rate
          </div>
        </div>
      </div>

      {/* Main dashboard grid */}
      <div className="dashboard-main-grid">
        {/* Task Progress */}
        <div className="dashboard-card dashboard-progress-card">
          <div className="dashboard-card-header">
            <div>
              <h3>Task Progress</h3>

              <p>
                Keep track of your overall productivity.
              </p>
            </div>

            <Link
              to="/tasks"
              className="dashboard-card-link"
            >
              View Tasks
            </Link>
          </div>

          <div className="progress-section">
            <div className="progress-info">
              <span>
                {loadingTasks
                  ? "Calculating..."
                  : `${statistics.completed} of ${statistics.total} completed`}
              </span>

              <strong>
                {loadingTasks
                  ? "..."
                  : `${statistics.percentage}%`}
              </strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${statistics.percentage}%`,
                }}
              />
            </div>
          </div>

          {error && (
            <p className="dashboard-error">
              {error}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h3>Quick Actions</h3>

              <p>
                Jump directly into your workspace.
              </p>
            </div>
          </div>

          <div className="quick-actions">
            <Link
              to="/tasks"
              className="quick-action"
            >
              <strong>Create Task</strong>
              <span>Manage your tasks</span>
            </Link>

            <Link
              to="/notes"
              className="quick-action"
            >
              <strong>Create Note</strong>
              <span>Write and organize notes</span>
            </Link>

            <Link
              to="/chat"
              className="quick-action"
            >
              <strong>AI Chat</strong>
              <span>Ask your AI assistant</span>
            </Link>

            <Link
              to="/pdf"
              className="quick-action"
            >
              <strong>Summarize PDF</strong>
              <span>Extract useful information</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="dashboard-card recent-tasks-card">
        <div className="dashboard-card-header">
          <div>
            <h3>Recent Tasks</h3>

            <p>
              Your latest tasks and their current status.
            </p>
          </div>

          <Link
            to="/tasks"
            className="dashboard-card-link"
          >
            Manage Tasks
          </Link>
        </div>

        {loadingTasks ? (
          <p className="dashboard-muted">
            Loading tasks...
          </p>
        ) : recentTasks.length === 0 ? (
          <div className="dashboard-empty">
            <h4>No tasks yet</h4>

            <p>
              Create your first task to start tracking
              your productivity.
            </p>

            <Link
              to="/tasks"
              className="dashboard-primary-link"
            >
              Create a Task
            </Link>
          </div>
        ) : (
          <div className="recent-tasks-list">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className={`recent-task ${
                  task.completed
                    ? "recent-task-completed"
                    : ""
                }`}
              >
                <div className="recent-task-info">
                  <strong>{task.title}</strong>

                  {task.description && (
                    <span>
                      {task.description}
                    </span>
                  )}
                </div>

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
            ))}
          </div>
        )}
      </div>

      {/* AI Tools */}
      <div className="dashboard-card ai-tools-card">
        <div className="dashboard-card-header">
          <div>
            <h3>AI Productivity Tools</h3>

            <p>
              Use SmartDesk AI to handle common
              productivity tasks.
            </p>
          </div>
        </div>

        <div className="ai-tools-grid">
          <Link
            to="/chat"
            className="ai-tool"
          >
            <strong>AI Chat</strong>
            <span>
              Ask questions and maintain
              conversations.
            </span>
          </Link>

          <Link
            to="/pdf"
            className="ai-tool"
          >
            <strong>PDF Summarizer</strong>
            <span>
              Turn lengthy PDFs into concise
              summaries.
            </span>
          </Link>

          <Link
            to="/email"
            className="ai-tool"
          >
            <strong>AI Email</strong>
            <span>
              Generate professional emails quickly.
            </span>
          </Link>

          <Link
            to="/resume"
            className="ai-tool"
          >
            <strong>AI Resume</strong>
            <span>
              Improve resumes and generate
              cover letters.
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}