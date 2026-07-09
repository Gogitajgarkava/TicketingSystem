import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const initialForm = {
  title: "",
  description: "",
  category: "music",
  city: "",
  venue: "",
  start_date: "", 
  max_capacity: "",
  ticket_price: "0",
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      
      const formattedDate = form.start_date.replace("T", " ") + ":00";

     const payload = {
         title: form.title,
         description: form.description,
         category: form.category,
         city: form.city,
         venue: form.venue,
         date: form.start_date.replace("T", " ") + ":00",
         price: parseFloat(form.ticket_price) || 0,
         total_tickets: parseInt(form.max_capacity, 10),
     };
      const res = await client.post("/events", payload);
      navigate(`/events`);
    } catch (err) {
      console.error("სერვერის შეცდომა:", err.response?.data);
      setError(err.response?.data?.message || "ივენთის შექმნა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card" style={{ maxWidth: 640 }}>
        <span className="eyebrow">ორგანიზატორი</span>
        <h1 style={{ fontFamily: "var(--font-display)", marginTop: 0 }}>ახალი ღონისძიების შექმნა</h1>
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>სახელი</label>
            <input required value={form.title} onChange={update("title")} />
          </div>
          
          <div className="form-group">
            <label>აღწერა</label>
            <textarea rows={4} value={form.description} onChange={update("description")} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>კატეგორია</label>
              <select value={form.category} onChange={update("category")}>
                <option value="music">მუსიკა</option>
                <option value="sports">სპორტი</option>
                <option value="tech">ტექნოლოგია</option>
                <option value="art">ხელოვნება</option>
                <option value="business">ბიზნესი</option>
                <option value="other">სხვა</option>
              </select>
            </div>
            <div className="form-group">
              <label>ქალაქი</label>
              <input required value={form.city} onChange={update("city")} />
            </div>
          </div>

          <div className="form-group">
            <label>ვენიუ / მისამართი</label>
            <input required value={form.venue} onChange={update("venue")} />
          </div>

          <div className="form-group">
            <label>თარიღი და დრო</label>
            <input 
              type="datetime-local" 
              required 
              value={form.start_date} 
              onChange={update("start_date")} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ბილეთის ფასი</label>
              <input type="number" min="0" step="0.01" value={form.ticket_price} onChange={update("ticket_price")} />
            </div>
            <div className="form-group">
              <label>მაქსიმალური ტევადობა</label>
              <input type="number" min="1" required value={form.max_capacity} onChange={update("max_capacity")} />
            </div>
          </div>

          <button className="pill-btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "იქმნება…" : "ღონისძიების შექმნა"}
          </button>
        </form>
      </div>
    </div>
  );
}