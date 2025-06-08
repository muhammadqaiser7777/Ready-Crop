from flask import Flask # type: ignore
from flask_cors import CORS # type: ignore
from config.supabaseConfig import supabase, SECRET_KEY
from config.mailConfig import mail
import routes
from dotenv import load_dotenv # type: ignore
import os

# Load environment variables
load_dotenv()
WEB_URL = os.getenv("WEB_URL")

app = Flask(__name__, static_url_path='/static')
CORS(app, resources={r"/*": {"origins": "*"}})

app.config["SECRET_KEY"] = SECRET_KEY  # Use imported SECRET_KEY

# Initialize Flask-Mail
mail.init_app(app)

# Register all routes from routes.py
app.register_blueprint(routes.routes)  # Use blueprint from routes.py

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

