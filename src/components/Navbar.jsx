import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  return <header className="topbar">
    <button className="menu-button" onClick={onMenu} aria-label="Open navigation">☰</button>
    <div className="topbar-title">Workspace <span>/</span> {user?.name || "Overview"}</div>
    <div className="topbar-user"><span className="avatar">{user?.name?.[0]?.toUpperCase() || "U"}</span><span className="user-name">{user?.name}</span><button className="text-button" onClick={logout}>Log out</button></div>
  </header>;
}