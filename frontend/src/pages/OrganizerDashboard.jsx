import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/events/organizer/mine").then((res) => {
      setEvents(res.data || []);
      setLoading(false);
    });
  }, []);

  const totalRevenue = events.reduce((sum, e) => sum + (e.sold_tickets || 0) * e.ticket_price, 0);
  const totalSold = events.reduce((sum, e) => sum + (e.sold_tickets || 0), 0);

  return (
    <div className="container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="eyebrow">ორგანიზატორის დაშბორდი</span>
          <h1>ჩემი ღონისძიებები</h1>
        </div>
        <Link to="/organizer/new" className="pill-btn">+ ახალი ივენთი</Link>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="value">{events.length}</div>
          <div className="label">სულ ივენთი</div>
        </div>
        <div className="stat-card">
          <div className="value">{totalSold}</div>
          <div className="label">გაყიდული ბილეთი</div>
        </div>
        <div className="stat-card">
          <div className="value">₾{totalRevenue.toFixed(2)}</div>
          <div className="label">საერთო შემოსავალი</div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">იტვირთება…</div>
      ) : events.length === 0 ? (
        <div className="empty-state">ჯერ არცერთი ივენთი არ შეგიქმნიათ.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>სახელი</th>
              <th>ქალაქი</th>
              <th>თარიღი</th>
              <th>ტევადობა</th>
              <th>ხელმისაწვდომი</th>
              <th>შემოსავალი</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.city}</td>
                <td>{new Date(e.start_date).toLocaleDateString("ka-GE")}</td>
                <td>{e.max_capacity}</td>
                <td>{e.available_seats}</td>
                <td>₾{((e.sold_tickets || 0) * e.ticket_price).toFixed(2)}</td>
                <td>
                  <Link to={`/organizer/events/${e.id}`} style={{ fontWeight: 600, color: "var(--teal)" }}>
                    რეპორტი →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
