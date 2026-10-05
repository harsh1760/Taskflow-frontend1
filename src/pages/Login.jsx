import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiMessage } from "../services/api";
import ErrorMessage from "../components/ErrorMessage";

export default function Login() {
  const { login, loading, isAuthenticated, user } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" }); const [error, setError] = useState("");
  if (isAuthenticated) return <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />;
  const submit = async (event) => { event.preventDefault(); setError(""); try { const data = await login(form); const destination = data.user?.role === "admin" ? "/admin" : "/dashboard"; navigate(destination, { replace: true }); } catch (err) { setError(apiMessage(err, "Unable to sign in. Check your details.")); } };
  return <AuthLayout title="Welcome back" subtitle="Sign in to continue to your workspace."><form className="auth-form" onSubmit={submit}><ErrorMessage message={error} /><label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" /></label><button className="button primary full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button><p className="auth-switch">New to Taskflow? <Link to="/register">Create an account</Link></p></form></AuthLayout>;
}

export function AuthLayout({ title, subtitle, children }) { return <main className="auth-page"><div className="auth-brand"><span className="brand-mark">T</span> Taskflow</div><section className="auth-panel"><div className="auth-kicker">YOUR WORKSPACE</div><h1>{title}</h1><p>{subtitle}</p>{children}</section><div className="auth-aside"><span>FOCUS</span><strong>Make progress<br />visible.</strong><p>A calm space for the work that moves your team forward.</p></div></main>; }