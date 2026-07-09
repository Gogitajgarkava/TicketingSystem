import os
from datetime import timedelta
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

 
    DB_SERVER = os.environ.get("DB_SERVER", r"localhost\SQLEXPRESS")
    DB_NAME = os.environ.get("DB_NAME", "ticketing_db")
    DB_DRIVER = os.environ.get("DB_DRIVER", "ODBC Driver 17 for SQL Server")
    DB_TRUSTED_CONNECTION = os.environ.get("DB_TRUSTED_CONNECTION", "yes")
    DB_USER = os.environ.get("DB_USER", "")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")

 
    if DB_TRUSTED_CONNECTION.lower() == "yes":
        odbc_str = (
            f"DRIVER={{{DB_DRIVER}}};"
            f"SERVER={DB_SERVER};"
            f"DATABASE={DB_NAME};"
            f"Trusted_Connection=yes;"
        )
    else:
        odbc_str = (
            f"DRIVER={{{DB_DRIVER}}};"
            f"SERVER={DB_SERVER};"
            f"DATABASE={DB_NAME};"
            f"UID={DB_USER};"
            f"PWD={DB_PASSWORD};"
        )

    SQLALCHEMY_DATABASE_URI = "mssql+pyodbc:///?odbc_connect=" + quote_plus(odbc_str)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    NOMINATIM_URL = os.environ.get(
        "NOMINATIM_URL", "https://nominatim.openstreetmap.org/search"
    )
    NOMINATIM_USER_AGENT = os.environ.get("NOMINATIM_USER_AGENT", "ticketing-app/1.0")

    QR_CODE_DIR = os.path.join(BASE_DIR, "static", "qrcodes")