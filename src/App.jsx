import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import VoiceTaskInput from "./components/VoiceTaskInput";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import TaskDetails from "./pages/TaskDetails";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function HomeRedirect() {
  const { user } = useAuth();

  return (
    <Navigate
      to={user?.role === "admin" ? "/admin" : "/dashboard"}
      replace
    />
  );
}

function VoiceTest() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Voice Task Assistant</h1>
      <VoiceTaskInput />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />
          </Route>

          {/* Profile */}
          <Route
            element={<ProtectedRoute allowAdmin />}
          >
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin */}
          <Route
            element={<ProtectedRoute admin />}
          >
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Temporary voice test */}
          <Route
            element={<ProtectedRoute />}
          >
            <Route path="/voice-test" element={<VoiceTest />} />
          </Route>

          {/* Home */}
          <Route path="/" element={<HomeRedirect />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}