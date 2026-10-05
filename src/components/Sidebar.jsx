import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const link = ({ isActive }) => `side-link ${isActive ? "active" : ""}`;
  return <aside className={`sidebar ${open ? "open" : ""}`}>
    <div className="brand"><span className="brand-mark">T</span><span>Taskflow</span><button className="close-menu" onClick={onClose}>×</button></div>
    <div className="workspace-label">Workspace</div>
    <nav className="side-nav">
      {user?.role === "admin" ? <>
        <NavLink to="/admin" className={link} onClick={onClose}><span>◇</span> Admin Overview</NavLink>
        <NavLink to="/admin#users" className={link} onClick={onClose}><span>◎</span> Users</NavLink>
        <NavLink to="/admin#tasks" className={link} onClick={onClose}><span>✓</span> All Tasks</NavLink>
        <NavLink to="/admin#statistics" className={link} onClick={onClose}><span>▦</span> Statistics</NavLink>
      </> : <>
        <NavLink to="/dashboard" className={link} onClick={onClose}><span>▦</span> Overview</NavLink>
        <NavLink to="/dashboard#tasks" className={link} onClick={onClose}><span>✓</span> My tasks</NavLink>
        <NavLink to="/ai-assistant" className={link} onClick={onClose}><span>✦</span> AI Assistant</NavLink>
      </>}
      <NavLink to="/profile" className={link} onClick={onClose}><span>○</span> Profile</NavLink>
    </nav>
    <div className="sidebar-bottom"><div className="mini-profile"><span className="avatar">{user?.name?.[0]?.toUpperCase() || "U"}</span><div><strong>{user?.name}</strong><small>{user?.role || "user"}</small></div></div><button className="side-logout" onClick={logout}>↪ <span>Log out</span></button></div>
  </aside>;
}