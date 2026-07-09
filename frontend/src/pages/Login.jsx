import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "შესვლა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <span className="eyebrow">ავტორიზაცია</span>
        <h1 style={{ fontFamily: "var(--font-display)", marginTop: 0 }}>შესვლა</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ელფოსტა</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>პაროლი</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="pill-btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "იტვირთება…" : "შესვლა"}
          </button>
        </form>
        <p style={{ marginTop: 20, fontSize: "0.9rem" }}>
          არ გაქვთ ანგარიში? <Link to="/register" style={{ fontWeight: 600 }}>დარეგისტრირდით</Link>
        </p>
      </div>
    </div>
  );
}
