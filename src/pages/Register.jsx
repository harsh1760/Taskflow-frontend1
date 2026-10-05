import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiMessage } from "../services/api";
import { AuthLayout } from "./Login";
import ErrorMessage from "../components/ErrorMessage";

export default function Register() {
  const { register, loading, isAuthenticated, user } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState(""); const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  if (isAuthenticated) return <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />;
  const submit = async (event) => { event.preventDefault(); setError(""); if (form.password.length < 6) return setError("Password must be at least 6 characters."); if (form.password !== form.confirm) return setError("Passwords do not match."); try { const data = await register({ name: form.name, email: form.email, password: form.password }); navigate(data.token ? "/dashboard" : "/login", { replace: true }); } catch (err) { setError(apiMessage(err, "Unable to create your account.")); } };
  return <AuthLayout title="Create your account" subtitle="Start organizing your work with a clearer view."><form className="auth-form" onSubmit={submit}><ErrorMessage message={error} /><label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label><label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><label>Password<input type="password" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></label><label>Confirm password<input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat your password" /></label><button className="button primary full" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></form></AuthLayout>;
}