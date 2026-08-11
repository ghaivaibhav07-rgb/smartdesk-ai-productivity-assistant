import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Chat from "./pages/Chat";
import PDF from "./pages/PDF";
import Email from "./pages/Email";
import Resume from "./pages/Resume";

import Layout from "./components/Layout";

import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Protected Application */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Tasks */}
          <Route
            path="/tasks"
            element={<Tasks />}
          />

          {/* Notes */}
          <Route
            path="/notes"
            element={<Notes />}
          />

          {/* AI Chat */}
          <Route
            path="/chat"
            element={<Chat />}
          />

          {/* PDF Summarizer */}
          <Route
            path="/pdf"
            element={<PDF />}
          />

          {/* AI Email */}
          <Route
            path="/email"
            element={<Email />}
          />

          {/* AI Resume */}
          <Route
            path="/resume"
            element={<Resume />}
          />
        </Route>

        {/* Root */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;