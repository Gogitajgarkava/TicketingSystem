from asyncio import events

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func
from app import db
from app.models import Event, User, Ticket
from app.utils.geocoder import get_lat_lon


events_bp = Blueprint('events', __name__, url_prefix='/api/events')


@events_bp.route('', methods=['GET'])
def get_events():
    city = request.args.get('city')
    category = request.args.get('category')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')

    query = Event.query.filter_by(is_published=True)

    if city:
        query = query.filter(Event.city.ilike(f'%{city}%'))
    if category:
        query = query.filter(Event.category == category)
    if min_price:
        query = query.filter(Event.ticket_price >= float(min_price))
    if max_price:
        query = query.filter(Event.ticket_price <= float(max_price))

    events = query.all()
    
    return jsonify([{
    "id": e.id,
    "title": e.title,
    "description": e.description,
    "category": e.category,
    "city": e.city,
    "venue": e.venue,
    "start_date": e.start_date.isoformat(),
    "ticket_price": e.ticket_price,
    "max_capacity": e.max_capacity,
    "available_seats": e.available_seats,
    "is_free": e.ticket_price == 0,
} for e in events]), 200    

@events_bp.route('', methods=['POST'])
@events_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    print("CREATE EVENT ENTERED")

    identity = get_jwt_identity()
    user = User.query.get(int(identity))

    if not user or user.role != 'organizer':
        return jsonify({
            'message': 'წვდომა უარყოფილია: საჭიროა ორგანიზატორის უფლებები'
        }), 403

    data = request.get_json()

    try:
        venue_address = data.get('venue', '')

        try:
            lat, lon = get_lat_lon(venue_address)
        except Exception as e:
            print("GEOCODER ERROR:", e)
            lat, lon = None, None

        event_date = datetime.strptime(
            data['date'],
            '%Y-%m-%d %H:%M:%S'
        )

        # ვინახავთ ტოტალ ბილეთებს ცვლადში, რომ ორჯერ გამოვიყენოთ
        total_tickets = int(data['total_tickets'])

        new_event = Event(
            organizer_id=user.id,
            title=data['title'],
            description=data.get('description', ''),
            category=data.get('category', 'Concert'),
            city=data.get('city', 'Tbilisi'),
            venue=venue_address,
            lat=lat,
            lon=lon,
            start_date=event_date,
            end_date=event_date,
            ticket_price=float(data['price']),
            max_capacity=total_tickets,
            is_published=True
        )

        db.session.add(new_event)
        db.session.commit()

        # აი აქ გასწორდა - ვაბრუნებთ მარტივ JSON-ს, ზედმეტი ციკლების გარეშე
        return jsonify({
            'message': 'ღონისძიება წარმატებით დაემატა',
            'id': new_event.id
        }), 200

    except Exception as e:
        db.session.rollback()
        print("CREATE EVENT ERROR:", str(e))
        return jsonify({
            'message': 'მონაცემების ფორმატი არასწორია',
            'error': str(e)
        }), 400
@events_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    identity = get_jwt_identity()
    user = User.query.get(identity)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'წვდომა უარყოფილია: საჭიროა ადმინისტრატორის უფლებები'}), 403

    event = Event.query.get_or_404(event_id)
    data = request.get_json()

    try:
        if 'title' in data: event.title = data['title']
        if 'description' in data: event.description = data['description']
        if 'category' in data: event.category = data['category']
        if 'city' in data: event.city = data['city']
        if 'venue' in data: event.venue = data['venue']
        if 'ticket_price' in data: event.ticket_price = float(data['ticket_price'])
        if 'max_capacity' in data: event.max_capacity = int(data['max_capacity'])
        
        if 'start_date' in data:
            event.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d %H:%M:%S')
        if 'end_date' in data:
            event.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d %H:%M:%S')

        db.session.commit()
        return jsonify({'message': 'ღონისძიება წარმატებით განახლდა'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'განახლებისას დაფიქსირდა შეცდომა', 'error': str(e)}), 400
    
@events_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    identity = get_jwt_identity()
    user = User.query.get(identity)
    
    if not user or user.role != 'admin':
        return jsonify({'message': 'წვდომა უარყოფილია: საჭიროა ადმინისტრატორის უფლებები'}), 403

    event = Event.query.get_or_404(event_id)

    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({'message': 'ღონისძიება წარმატებით წაიშალა'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'წაშლისას დაფიქსირდა შეცდომა', 'error': str(e)}), 400
@events_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)

    return jsonify({
        "event": {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "category": event.category,
            "city": event.city,
            "venue": event.venue,
            "start_date": event.start_date.strftime("%Y-%m-%d %H:%M:%S"),
            "ticket_price": event.ticket_price,
            "max_capacity": event.max_capacity,
            "available_seats": event.max_capacity - sum(
                t.quantity for t in event.tickets if t.status == "active"
            ),
            "lat": event.lat,
            "lon": event.lon,
            "is_free": float(event.ticket_price or 0) == 0
        }
    }), 200
@events_bp.route('/<int:event_id>/attendees', methods=['GET'])
@jwt_required()
def get_event_attendees(event_id):
    identity = get_jwt_identity()
    user = User.query.get(identity)
    
    event = Event.query.get_or_404(event_id)
    
    if not user or (user.role != 'admin' and event.organizer_id != user.id):
        return jsonify({'message': 'წვდომა უარყოფილია'}), 403

    tickets = Ticket.query.filter_by(event_id=event_id, status='active').all()
    
    attendees = [{
        'id': t.id,
        'buyer_name': t.buyer.username,
        'buyer_email': t.buyer.email,
        'quantity': t.quantity,
        'total_price': t.total_price,
        'ticket_number': t.ticket_number,
        'booked_at': t.booked_at.strftime('%Y-%m-%d %H:%M:%S'),
        'status': t.status
    } for t in tickets]
    
    total_tickets_sold = sum(t.quantity for t in tickets)
    total_revenue = sum(t.total_price for t in tickets)
    cancelled_tickets = Ticket.query.filter_by(event_id=event_id, status='cancelled').count()
    
    return jsonify({
        'event': {
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'category': event.category,
            'city': event.city,
            'venue': event.venue,
            'start_date': event.start_date.strftime('%Y-%m-%d %H:%M:%S'),
            'ticket_price': event.ticket_price,
            'max_capacity': event.max_capacity,
            'available_seats': event.available_seats
        },
        'attendees': attendees,
        'report': {
            'total_tickets_sold': total_tickets_sold,
            'total_revenue': total_revenue,
            'available_seats': event.available_seats,
            'cancelled_tickets': cancelled_tickets
        }
    }), 200

@events_bp.route('/organizer/mine', methods=['GET'])
@jwt_required()
def get_organizer_events():
    identity = get_jwt_identity()
    
    events = Event.query.filter_by(organizer_id=int(identity)).all()
    
    return jsonify([{
        'id': e.id,
        'title': e.title,
        'city': e.city,
        'category': e.category,
        'ticket_price': e.ticket_price,
        'start_date': e.start_date.strftime('%Y-%m-%d %H:%M:%S'),
        'max_capacity': e.max_capacity,
        'sold_tickets': sum(t.quantity for t in e.tickets if t.status == 'active'),
        'available_seats': e.max_capacity - sum(t.quantity for t in e.tickets if t.status == 'active')
    } for e in events]), 200