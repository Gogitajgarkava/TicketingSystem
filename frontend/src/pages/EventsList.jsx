import React, { useEffect, useState } from "react";
import client from "../api/client";
import EventCard from "../components/EventCard.jsx";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", city: "", date: "", price: "" });

  const fetchEvents = async () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    try {
      const res = await client.get("/events", { params });
     setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="container">
      <div className="page-header">
        <span className="eyebrow">აღმოაჩინე ღონისძიებები</span>
        <h1>რა ხდება ახლოს</h1>
        <p>დაჯავშნე ბილეთი, თვალი ადევნე ხელმისაწვდომ ადგილებს რეალურ დროში.</p>
      </div>

      <form className="filters-bar" onSubmit={applyFilters}>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">ყველა კატეგორია</option>
          <option value="music">მუსიკა</option>
          <option value="sports">სპორტი</option>
          <option value="tech">ტექნოლოგია</option>
          <option value="art">ხელოვნება</option>
          <option value="business">ბიზნესი</option>
          <option value="other">სხვა</option>
        </select>
        <input
          placeholder="ქალაქი"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <select
          value={filters.price}
          onChange={(e) => setFilters({ ...filters, price: e.target.value })}
        >
          <option value="">ნებისმიერი ფასი</option>
          <option value="free">უფასო</option>
          <option value="paid">ფასიანი</option>
        </select>
        <button className="pill-btn outline" type="submit">
          გაფილტვრა
        </button>
      </form>

      {loading ? (
        <div className="empty-state">იტვირთება…</div>
      ) : events.length === 0 ? (
        <div className="empty-state">ამ ფილტრებით ღონისძიება ვერ მოიძებნა.</div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
