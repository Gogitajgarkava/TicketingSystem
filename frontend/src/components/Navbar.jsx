import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="dot" />
        Venu
      </Link>
      <div className="navbar-links">
        <Link to="/">ივენთები</Link>
        {user && user.role === "attendee" && <Link to="/my-tickets">ჩემი ბილეთები</Link>}
        {user && user.role === "organizer" && <Link to="/organizer">დაშბორდი</Link>}
        {user ? (
          <>
            <span className="role-badge">{user.role}</span>
            <button onClick={handleLogout}>გასვლა</button>
          </>
        ) : (
          <>
            <Link to="/login">შესვლა</Link>
            <Link to="/register" className="pill-btn">
              რეგისტრაცია
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
