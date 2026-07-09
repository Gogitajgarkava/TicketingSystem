from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from dotenv import load_dotenv
from config import Config

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, static_url_path='/static', static_folder='../static')
    
    app.config.from_object(Config)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', app.config['SQLALCHEMY_DATABASE_URI'])
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['JWT_SECRET_KEY'])

    db.init_app(app)
    jwt.init_app(app)
    
    CORS(app, 
         origins=["http://localhost:3000", "http://127.0.0.1:3000"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True,
         max_age=3600
    )
    
    with app.app_context():
        from app.models import User, Event, Ticket
        
        from app.routes.auth import auth_bp
        from app.routes.events import events_bp
        from app.routes.tickets import tickets_bp
        app.register_blueprint(auth_bp)
        app.register_blueprint(events_bp)
        app.register_blueprint(tickets_bp)

        db.create_all()
    
    return app