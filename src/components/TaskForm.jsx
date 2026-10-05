import { useEffect, useState } from "react";

const blank = { title: "", description: "", status: "todo", priority: "medium", dueDate: "" };
export default function TaskForm({ task, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(blank); const [error, setError] = useState("");
  useEffect(() => setForm(task ? { ...blank, ...task, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "" } : blank), [task]);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = (event) => { event.preventDefault(); if (!form.title.trim()) return setError("A task title is required."); setError(""); onSubmit({ ...form, title: form.title.trim(), dueDate: form.dueDate || undefined }); };
  return <form className="task-form" onSubmit={submit}>
    {error && <div className="alert alert-error">{error}</div>}
    <label>Title<input name="title" value={form.title} onChange={change} placeholder="What needs to be done?" autoFocus /></label>
    <label>Description<textarea name="description" value={form.description} onChange={change} placeholder="Add some context..." rows="4" /></label>
    <div className="form-grid"><label>Status<select name="status" value={form.status} onChange={change}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Completed</option></select></label><label>Priority<select name="priority" value={form.priority} onChange={change}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div>
    <label>Due date<input type="date" name="dueDate" value={form.dueDate} onChange={change} /></label>
    <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving..." : task ? "Save changes" : "Create task"}</button></div>
  </form>;
}