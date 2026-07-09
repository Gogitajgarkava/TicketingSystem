import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORY_LABELS = {
  music: "მუსიკა",
  sports: "სპორტი",
  tech: "ტექნოლოგია",
  art: "ხელოვნება",
  business: "ბიზნესი",
  other: "სხვა",
};

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [booking, setBooking] = useState(false);

  const loadEvent = async () => {
    const res = await client.get(`/events/${id}`);
    setEvent(res.data.event);
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  if (!event) return <div className="container">იტვირთება…</div>;

  const date = new Date(event.start_date);
  const dateStr = date.toLocaleDateString("ka-GE", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" });

  const handleBook = async () => {
    setError("");
    setSuccess("");
    if (!user) {
      navigate("/login");
      return;
    }
    setBooking(true);
    try {
      await client.post("/tickets", { event_id: event.id, quantity });
      setSuccess("ბილეთი წარმატებით დაჯავშნილია! იხილეთ „ჩემი ბილეთები“ განყოფილებაში.");
      await loadEvent();
      setQuantity(1);
    } catch (err) {
      setError(err.response?.data?.error || "დაჯავშნა ვერ მოხერხდა");
    } finally {
      setBooking(false);
    }
  };

  const maxQty = Math.max(0, Math.min(event.available_seats, 10));
  const total = (event.ticket_price * quantity).toFixed(2);

  return (
    <div className="container">
      <div className="detail-hero">
        <div className="detail-info">
          <span className="eyebrow">{CATEGORY_LABELS[event.category] || event.category}</span>
          <h1>{event.title}</h1>
          <div className="detail-meta-row">
            <span>📍 {event.venue}, {event.city}</span>
            <span>🗓 {dateStr} · {timeStr}</span>
            <span>👥 {event.available_seats} / {event.max_capacity} ხელმისაწვდომი</span>
          </div>
          {event.description && <p style={{ maxWidth: 560, lineHeight: 1.6 }}>{event.description}</p>}
          {event.lat && event.lon && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
              კოორდინატები: {event.lat.toFixed(5)}, {event.lon.toFixed(5)}
            </p>
          )}
        </div>

        <div className="booking-box">
          <h3>{event.is_free ? "უფასო რეგისტრაცია" : `₾${event.ticket_price} / ბილეთი`}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {event.available_seats <= 0 ? (
            <p style={{ color: "var(--red-cancel)", fontWeight: 600 }}>ბილეთები ამოწურულია</p>
          ) : (
            <>
              <div className="qty-control">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
                  −
                </button>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem" }}>{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty}>
                  +
                </button>
              </div>
              <div className="total-line">სულ: ₾{total}</div>
              <button className="pill-btn" style={{ width: "100%" }} onClick={handleBook} disabled={booking}>
                {booking ? "მუშავდება…" : "ბილეთის დაჯავშნა"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
