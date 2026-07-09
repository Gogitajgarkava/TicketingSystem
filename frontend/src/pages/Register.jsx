import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "attendee",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  const payload = { username: form.username, email: form.email, password: form.password, role: form.role };
  console.log("🚀 Payload to be sent:", payload);

  setError("");
  setLoading(true);
  try {
    await register(payload);
    navigate("/");
  } catch (err) {
    console.error("❌ Full Error Object:", err);
    console.error("❌ Response Data:", err.response?.data);
    setError(err.response?.data?.message || "რეგისტრაცია ვერ მოხერხდა");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container">
      <div className="form-card">
        <span className="eyebrow">ახალი ანგარიში</span>
        <h1 style={{ fontFamily: "var(--font-display)", marginTop: 0 }}>რეგისტრაცია</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>მომხმარებლის სახელი</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
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
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>ტელეფონი (არასავალდებულო)</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>როლი</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="attendee">დამსწრე (ბილეთების ყიდვა)</option>
              <option value="organizer">ორგანიზატორი (ივენთების შექმნა)</option>
            </select>
          </div>
          <button className="pill-btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "იტვირთება…" : "რეგისტრაცია"}
          </button>
        </form>
        <p style={{ marginTop: 20, fontSize: "0.9rem" }}>
          უკვე გაქვთ ანგარიში? <Link to="/login" style={{ fontWeight: 600 }}>შედით</Link>
        </p>
      </div>
    </div>
  );
}
