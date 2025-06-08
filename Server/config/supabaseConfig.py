import os
from supabase import create_client, Client # type: ignore
from dotenv import load_dotenv # type: ignore

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")  # Add SECRET_KEY

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL or Key is missing. Check your .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
