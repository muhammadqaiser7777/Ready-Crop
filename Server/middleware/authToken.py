import jwt  # type: ignore
import os
from dotenv import load_dotenv  # type: ignore
from datetime import datetime, timedelta

load_dotenv()  # Load environment variables

SECRET_KEY = os.getenv("SECRET_KEY")
TEMP_SECRET_KEY = os.getenv("TEMP_SECRET_KEY")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is missing. Check your .env file.")

if not TEMP_SECRET_KEY:
    raise ValueError("TEMP_SECRET_KEY is missing. Check your .env file.")

EXPIRY_DURATION = timedelta(minutes=3)  # Define expiry duration

def generate_auth_token(email):
    """Generate a non-expiring JWT token using email."""
    payload = {"email": email}
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def generate_temp_token(email):
    """Generate a JWT token with a 3-minute expiration time and return both token and expiry time."""
    expiry_time = datetime.utcnow() + EXPIRY_DURATION
    token = jwt.encode(dict(email=email, exp=expiry_time), TEMP_SECRET_KEY, algorithm="HS256")
    return token, expiry_time.isoformat()
