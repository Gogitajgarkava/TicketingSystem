from flask import Blueprint, request, jsonify
from app.models import db, Event, Ticket, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import uuid
from app.utils.qr_generator import generate_ticket_qr

tickets_bp = Blueprint('tickets', __name__, url_prefix='/api/tickets')


@tickets_bp.route('', methods=['POST'])
@jwt_required()
def purchase_ticket():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'მომხმარებელი ვერ მოიძებნა'}), 404

        data = request.get_json()
        event_id = data.get('event_id')
        quantity = int(data.get('quantity', 1))

        event = Event.query.get(event_id)
        if not event:
            return jsonify({'message': 'Event not found'}), 404

        sold = sum(t.quantity for t in event.tickets if t.status == "active")
        if (event.max_capacity - sold) < quantity:
            return jsonify({'message': 'არასაკმარისი ადგილები'}), 400

        total_price = float(event.ticket_price or 0.0) * quantity
        ticket_number = f"TKT-{event.id}-{str(uuid.uuid4())[:8].upper()}"
        
        qr_path = generate_ticket_qr(ticket_number)

        ticket = Ticket(
            event_id=event.id,
            user_id=user_id,
            quantity=quantity,
            total_price=total_price,
            ticket_number=ticket_number,
            status="active",
            booked_at=datetime.utcnow(),
            qr_code_path=qr_path
        )

        db.session.add(ticket)
        db.session.commit()

        return jsonify({"message": "ბილეთი წარმატებით შეძენილია", "ticket_id": ticket.id}), 201
    except Exception as e:
        print("ERROR:", str(e))
        db.session.rollback()
        return jsonify({'message': 'სერვერის შეცდომა', 'error': str(e)}), 500


@tickets_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_tickets():
    user_id = int(get_jwt_identity())

    tickets = Ticket.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "ticket_id": t.id,
            "event_title": t.event.title if t.event else "Unknown",
            "purchase_date": t.booked_at.strftime("%Y-%m-%d %H:%M") if t.booked_at else None,
            "status": t.status,
            "ticket_number": t.ticket_number,
            "quantity": t.quantity,
            "total_price": t.total_price,
            "qr_code_path": t.qr_code_path
        }
        for t in tickets
    ]), 200


@tickets_bp.route('/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
def cancel_ticket(ticket_id):
    user_id = int(get_jwt_identity())

    ticket = Ticket.query.get_or_404(ticket_id)

    if ticket.user_id != user_id:
        return jsonify({"message": "არ გაქვს უფლება ამ ბილეთის გაუქმების"}), 403

    if datetime.utcnow() > (ticket.event.start_date - timedelta(hours=48)):
        return jsonify({
            "message": "ბილეთის გაუქმება შეუძლებელია (48 საათზე ნაკლები დარჩა)"
        }), 400

    ticket.status = "cancelled"
    db.session.commit()

    return jsonify({"message": "ბილეთი გაუქმდა"}), 200