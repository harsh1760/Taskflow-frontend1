import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { apiMessage } from "../services/api";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { PageLayout, Modal } from "./Dashboard";
import TaskForm from "../components/TaskForm";

export default function TaskDetails() {
  const { id } = useParams(); const navigate = useNavigate(); const [task, setTask] = useState(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [editing, setEditing] = useState(false);
  const load = async () => { try { const { data } = await api.get("/tasks", { params: { limit: 100 } }); const found = data.tasks.find((item) => item._id === id); if (!found) setError("Task not found."); else setTask(found); } catch (err) { setError(apiMessage(err, "Unable to load this task.")); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [id]);
  const update = async (data) => { try { const response = await api.patch(`/tasks/${id}`, data); setTask(response.data); setEditing(false); } catch (err) { setError(apiMessage(err, "Unable to update task.")); } };
  const remove = async () => { if (!window.confirm("Delete this task?")) return; try { await api.delete(`/tasks/${id}`); navigate("/dashboard"); } catch (err) { setError(apiMessage(err, "Unable to delete task.")); } };
  return <PageLayout><Link className="back-link" to="/dashboard">← Back to tasks</Link>{loading ? <Loading label="Loading task" /> : error || !task ? <div className="detail-error"><ErrorMessage message={error || "Task not found."} /><Link className="button secondary" to="/dashboard">Return to dashboard</Link></div> : <section className="detail-page"><div className="detail-top"><div><div className="eyebrow">Task details</div><h1>{task.title}</h1><div className="task-meta"><span className={`badge status-${task.status}`}>{task.status}</span><span className={`badge priority-${task.priority}`}>{task.priority} priority</span></div></div><div className="task-actions"><button className="button secondary" onClick={() => setEditing(true)}>Edit</button><button className="button danger" onClick={remove}>Delete</button></div></div><div className="detail-card"><h3>Description</h3><p>{task.description || "No description provided."}</p><dl><div><dt>Due date</dt><dd>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</dd></div><div><dt>Created</dt><dd>{new Date(task.createdAt).toLocaleDateString()}</dd></div><div><dt>Last updated</dt><dd>{new Date(task.updatedAt).toLocaleDateString()}</dd></div><div><dt>Owner</dt><dd>{task.owner?.name || "You"}</dd></div></dl></div></section>}{editing && <Modal title="Edit task" onClose={() => setEditing(false)}><TaskForm task={task} onSubmit={update} onCancel={() => setEditing(false)} /></Modal>}</PageLayout>;
}