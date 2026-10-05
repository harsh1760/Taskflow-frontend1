import TaskCard from "./TaskCard";
import Loading from "./Loading";

export default function TaskList({ tasks, loading, onDelete, onEdit, onCreate }) {
  if (loading) return <Loading label="Loading tasks" />;
  if (!tasks.length) return <div className="empty-state"><div className="empty-icon">✓</div><h3>No tasks yet</h3><p>Create your first task to get started.</p><button className="button primary" onClick={onCreate}>Create task</button></div>;
  return <div className="task-list">{tasks.map((task) => <TaskCard key={task._id} task={task} onDelete={onDelete} onEdit={onEdit} />)}</div>;
}