import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import EventsList from "./pages/EventsList.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyTickets from "./pages/MyTickets.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import OrganizerDashboard from "./pages/OrganizerDashboard.jsx";
import EventReport from "./pages/EventReport.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute role="attendee">
              <MyTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute role="organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/new"
          element={
            <ProtectedRoute role="organizer">
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id"
          element={
            <ProtectedRoute role="organizer">
              <EventReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}