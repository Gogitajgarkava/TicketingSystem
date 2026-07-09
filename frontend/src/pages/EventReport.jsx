import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";

export default function EventReport() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get(`/events/${id}/attendees`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || "რეპორტის ჩატვირთვა ვერ მოხერხდა"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container">იტვირთება…</div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

  const { event, attendees, report } = data;

  return (
    <div className="container">
      <div className="page-header">
        <span className="eyebrow">ივენთის რეპორტი</span>
        <h1>{event.title}</h1>
        <p>{event.venue}, {event.city} · {new Date(event.start_date).toLocaleString("ka-GE")}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="value">{report.total_tickets_sold}</div>
          <div className="label">გაყიდული ბილეთი</div>
        </div>
        <div className="stat-card">
          <div className="value">₾{report.total_revenue.toFixed(2)}</div>
          <div className="label">შემოსავალი</div>
        </div>
        <div className="stat-card">
          <div className="value">{report.available_seats}</div>
          <div className="label">დარჩენილი ადგილი</div>
        </div>
        <div className="stat-card">
          <div className="value">{report.cancelled_tickets}</div>
          <div className="label">გაუქმებული ბილეთი</div>
        </div>
      </div>

      <h2 className="section-title">დამსწრეები</h2>
      {attendees.length === 0 ? (
        <div className="empty-state">ჯერ არავის უყიდია ბილეთი.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>მომხმარებელი</th>
              <th>ელფოსტა</th>
              <th>ბილეთის ნომერი</th>
              <th>რაოდენობა</th>
              <th>თანხა</th>
              <th>დაჯავშნის თარიღი</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((a) => (
              <tr key={a.ticket_number}>
                <td>{a.username}</td>
                <td>{a.email}</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{a.ticket_number}</td>
                <td>{a.quantity}</td>
                <td>₾{a.total_price.toFixed(2)}</td>
                <td>{new Date(a.booked_at).toLocaleString("ka-GE")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
