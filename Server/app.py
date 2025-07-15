from flask import Flask  # type: ignore
from flask_cors import CORS  # type: ignore
from config.supabaseConfig import supabase, SECRET_KEY
from config.mailConfig import mail
import routes
from dotenv import load_dotenv  # type: ignore
import os

# For scheduling
from apscheduler.schedulers.background import BackgroundScheduler  # type: ignore
from controllers.mailReminderController import check_and_send_reminders

# Load environment variables
load_dotenv()
WEB_URL = os.getenv("WEB_URL")

app = Flask(__name__, static_url_path='/static')
CORS(app, resources={r"/*": {"origins": "*"}})

app.config["SECRET_KEY"] = SECRET_KEY  # Use imported SECRET_KEY

# Initialize Flask-Mail
mail.init_app(app)

# Register all routes from routes.py
app.register_blueprint(routes.routes)

# Wrap reminder function in application context
def run_reminder_job():
    with app.app_context():
        check_and_send_reminders()

# Setup APScheduler
scheduler = BackgroundScheduler()
scheduler.add_job(run_reminder_job, 'interval', hours=1)  # For testing
scheduler.start()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)