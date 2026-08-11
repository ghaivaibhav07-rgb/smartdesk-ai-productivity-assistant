import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Tasks", path: "/tasks" },
  { label: "Notes", path: "/notes" },
  { label: "AI Chat", path: "/chat" },
  { label: "PDF", path: "/pdf" },
  { label: "AI Email", path: "/email" },
  { label: "AI Resume", path: "/resume" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>SmartDesk</h2>
        <p>AI Productivity Assistant</p>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {user && (
          <div className="sidebar-user">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        )}

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}