import { useEffect, useState } from "react";
import api, { apiMessage } from "../services/api";
import { PageLayout, StatCard } from "./Dashboard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [overviewResponse, usersResponse, tasksResponse] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/tasks")
      ]);
      setOverview(overviewResponse.data);
      setUsers(usersResponse.data);
      setTasks(tasksResponse.data);
    } catch (requestError) {
      setError(apiMessage(requestError, "Unable to load admin data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (user) => {
    const role = user.role === "admin" ? "user" : "admin";
    try {
      const { data } = await api.patch(`/admin/users/${user._id}`, { role });
      setUsers(users.map((item) => item._id === data._id ? data : item));
    } catch (requestError) {
      setError(apiMessage(requestError, "Unable to update role."));
    }
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Delete ${user.name} and their tasks?`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers(users.filter((item) => item._id !== user._id));
      setTasks(tasks.filter((task) => task.owner?._id !== user._id));
    } catch (requestError) {
      setError(apiMessage(requestError, "Unable to delete user."));
    }
  };

  const removeTask = async (task) => {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    try {
      await api.delete(`/admin/tasks/${task._id}`);
      setTasks(tasks.filter((item) => item._id !== task._id));
    } catch (requestError) {
      setError(apiMessage(requestError, "Unable to delete task."));
    }
  };

  if (loading) return <PageLayout><Loading label="Loading admin workspace" /></PageLayout>;

  return <PageLayout>
    <div className="page-heading"><div><div className="eyebrow">Administration</div><h1>Admin Dashboard</h1><p>Monitor your team and task activity.</p></div></div>
    <ErrorMessage message={error} onRetry={load} />
    <div className="stats-grid">
      <StatCard label="Total users" value={overview?.users || 0} icon="◎" />
      <StatCard label="Total tasks" value={overview?.tasks || 0} icon="○" />
      <StatCard label="Pending tasks" value={overview?.taskStats?.find((item) => item._id === "todo")?.count || 0} icon="◷" tone="amber" />
      <StatCard label="Completed tasks" value={overview?.taskStats?.find((item) => item._id === "done")?.count || 0} icon="✓" tone="green" />
    </div>
    <div className="admin-grid">
      <section className="data-panel"><div className="section-heading"><div><h2>Users</h2><p>Manage workspace access.</p></div></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td><strong>{user.name}</strong><small>{user.email}</small></td><td><span className="role-chip">{user.role}</span></td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td><button className="table-action" onClick={() => changeRole(user)}>{user.role === "admin" ? "Make user" : "Make admin"}</button><button className="table-action danger-text" onClick={() => removeUser(user)}>Delete</button></td></tr>)}</tbody></table></div></section>
      <section className="data-panel" id="tasks"><div className="section-heading"><div><h2>Tasks</h2><p>All workspace tasks.</p></div></div><div className="admin-task-list">{tasks.length ? tasks.map((task) => <div className="admin-task" key={task._id}><span className={`status-dot ${task.status}`} /><div><strong>{task.title}</strong><small>{task.owner?.name || "Unknown owner"}</small></div><span className={`badge status-${task.status}`}>{task.status}</span><button className="table-action danger-text" onClick={() => removeTask(task)}>Delete</button></div>) : <p className="empty-copy">No tasks have been created yet.</p>}</div></section>
    </div>
  </PageLayout>;
}
