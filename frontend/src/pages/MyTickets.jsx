import React, { useEffect, useState } from "react";
import client from "../api/client";
import "../styles/pages/MyTickets.css";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get("/tickets/my");
      setTickets(res.data);
    } catch (err) {
      console.error("ბილეთების ჩატვირთვა ვერ მოხერხდა:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (ticketId) => {
    setMessage({ type: "", text: "" });
    try {
      await client.delete(`/tickets/${ticketId}`);
      setMessage({ type: "success", text: "ბილეთი წარმატებით გაუქმდა." });
      await load(); 
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "გაუქმება ვერ მოხერხდა" 
      });
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <span className="eyebrow">შენი ბილეთები</span>
        <h1>ჩემი ბილეთები</h1>
        <p>გაუქმება შესაძლებელია ღონისძიების დაწყებამდე მინიმუმ 48 საათით ადრე.</p>
      </div>

      {message.text && (
        <div className={`alert ${message.type === "error" ? "alert-error" : "alert-success"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="empty-state">იტვირთება…</div>
      ) : tickets.filter(t => t.status === "active").length === 0 ? (
        <div className="empty-state">ჯერ არცერთი ბილეთი არ გაქვთ დაჯავშნილი.</div>
      ) : (
        <div className="my-tickets-grid">
          {tickets.filter(t => t.status === "active").map((t) => (
            <div key={t.ticket_id} className="ticket-card" style={{ padding: 0 }}>
              <div className="ticket-main">
                <h3 className="ticket-title">{t.event_title}</h3>
                <div className="ticket-meta">
                  <span>ბილეთის ნომერი: {t.ticket_number}</span>
                  <span>რაოდენობა: {t.quantity}</span>
                  <span>ფასი: ₾{t.total_price?.toFixed(2)}</span>
                  <span>შენაძენის თარიღი: {t.purchase_date}</span>
                </div>
                
                {t.qr_code_path && (
                  <div className="qr-display">
                    <img 
                      src={`http://localhost:5000${t.qr_code_path}`} 
                      alt="ბილეთის QR კოდი" 
                      className="qr-preview"
                    />
                  </div>
                )}
                
                <button
                  className="pill-btn danger"
                  style={{ marginTop: 10 }}
                  onClick={() => handleCancel(t.ticket_id)}
                >
                  ბილეთის გაუქმება
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}