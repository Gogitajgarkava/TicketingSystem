from datetime import datetime
import uuid

from werkzeug.security import generate_password_hash, check_password_hash

from app import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='attendee')
    phone = db.Column(db.String(20))
    events = db.relationship("Event", backref="organizer", lazy=True)
    tickets = db.relationship("Ticket", backref="buyer", lazy=True)
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    organizer_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    venue = db.Column(db.String(200), nullable=False)

    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

    ticket_price = db.Column(db.Float, default=0.0)
    max_capacity = db.Column(db.Integer, nullable=False)

    is_published = db.Column(db.Boolean, default=True)

    lat = db.Column(db.Float)
    lon = db.Column(db.Float)

    tickets = db.relationship("Ticket", backref="event", lazy=True)

    @property
    def sold_tickets_count(self):
        return sum(
            t.quantity
            for t in self.tickets
            if t.status == "active"
        )

    @property
    def available_seats(self):
        return self.max_capacity - self.sold_tickets_count


class Ticket(db.Model):
    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)

    event_id = db.Column(
        db.Integer,
        db.ForeignKey("events.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    quantity = db.Column(db.Integer, default=1, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

    ticket_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="active"
    )

    booked_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    qr_code_path = db.Column(db.String(255))

    def generate_ticket_number(self):
        uid = uuid.uuid4().hex[:8].upper()
        self.ticket_number = f"TKT-{self.event_id}-{uid}"