import React from "react";
import { Link } from "react-router-dom";

const CATEGORY_LABELS = {
  music: "მუსიკა",
  sports: "სპორტი",
  tech: "ტექნოლოგია",
  art: "ხელოვნება",
  business: "ბიზნესი",
  other: "სხვა",
};

export default function EventCard({ event }) {
  const date = new Date(event.start_date);
  const dateStr = date.toLocaleDateString("ka-GE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("ka-GE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const lowSeats = event.available_seats <= event.max_capacity * 0.1;
  const soldOut = event.available_seats <= 0;

  return (
    <Link to={`/events/${event.id}`} className="ticket-card">
      <div className="ticket-main">
        <span className="ticket-category">
          {CATEGORY_LABELS[event.category] || event.category}
        </span>
        <h3 className="ticket-title">{event.title}</h3>
        <div className="ticket-meta">
          <span>📍 {event.venue}, {event.city}</span>
          <span>🗓 {dateStr} · {timeStr}</span>
        </div>
      </div>
      <div className="ticket-stub">
        <div className="ticket-price">
          {event.is_free ? "უფასო" : `₾${event.ticket_price}`}
        </div>
        <div className={`ticket-seats ${soldOut ? "low" : lowSeats ? "low" : ""}`}>
          {soldOut ? "ბილეთი ამოწურულია" : `${event.available_seats} ადგილი`}
        </div>
      </div>
    </Link>
  );
}
