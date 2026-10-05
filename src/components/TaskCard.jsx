import { Link } from "react-router-dom";

const statusLabels = { todo: "To do", "in-progress": "In progress", done: "Completed" };
export default function TaskCard({ task, onDelete, onEdit }) {
  return <article className="task-card">
    <div className="task-card-main"><div className="task-card-heading"><span className={`status-dot ${task.status}`} /> <h3>{task.title}</h3></div><p>{task.description || "No description provided."}</p><div className="task-meta"><span className={`badge status-${task.status}`}>{statusLabels[task.status] || task.status}</span><span className={`badge priority-${task.priority}`}>{task.priority} priority</span>{task.dueDate && <span className="due-date">Due {new Date(task.dueDate).toLocaleDateString()}</span>}</div></div>
    <div className="task-actions"><Link className="icon-button" to={`/tasks/${task._id}`} title="View task">View</Link><button className="icon-button" onClick={() => onEdit(task)}>Edit</button><button className="icon-button danger-text" onClick={() => onDelete(task)}>Delete</button></div>
  </article>;
}