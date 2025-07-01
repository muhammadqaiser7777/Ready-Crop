from flask import Blueprint # type: ignore # Blueprint for grouping all routes
# Importing controllers for various functionalities
from controllers.authController import signup, verify, login, logout
from controllers.passwordController import (
    change_password, password_forget, verify_identity, set_new_password
)
from controllers.otpController import otpRefresh, validate_otp
from controllers.predictController import predict_green_chilli
from controllers.plantRecordsController import savePlantRecord, deletePlantRecord, viewPlantRecords
from controllers.mailReminderController import check_and_send_reminders
from controllers.notificationController import generate_notifications, check_unread_notifications, get_user_notifications
from controllers.weatherController import get_weather

# Initialize Blueprint
routes = Blueprint("routes", __name__)

# ===================== 🔐 Authentication Routes =====================

# Handles user registration and stores user info
routes.route("/signup", methods=["POST"])(signup)

# Verifies OTP for newly signed-up users
routes.route("/verify", methods=["POST"])(verify)

# Authenticates user credentials and generates token
routes.route("/login", methods=["POST"])(login)

# Invalidates user token to log out
routes.route("/logout", methods=["POST"])(logout)

# ===================== 🔑 Password Management Routes =====================

# Change password for logged-in users
routes.route("/change-password", methods=["POST"])(change_password)

# Initiates "forgot password" flow (sends OTP)
routes.route("/password-forget", methods=["POST"])(password_forget)

# Validates identity via OTP before setting new password
routes.route("/verify-identity", methods=["POST"])(verify_identity)

# Sets new password after verification
routes.route("/set-new-password", methods=["POST"])(set_new_password)

# ===================== 🔁 OTP Handling Routes =====================

# Refreshes and resends OTP
routes.route("/otp-refresh", methods=["POST"])(otpRefresh)

# Validates entered OTP against stored value
routes.route("/validate-otp", methods=["POST"])(validate_otp)

# ===================== 🌿 Plant Prediction Route =====================

# Uses ML model to predict green chilli plant age/class
routes.route("/predict-green-chilli", methods=["POST"])(predict_green_chilli)

# ===================== 🌱 Plant Record Management =====================

# Saves a new plant record with prediction and ownership info
routes.route("/save-plant-record", methods=["POST"])(savePlantRecord)

# View all plant records with prediction and ownership info
routes.route("/view-plant-records", methods=["POST"])(viewPlantRecords)

# Deletes a plant record by ID (auth-protected)
routes.route("/delete-plant-record", methods=["POST"])(deletePlantRecord)

# ===================== 📧 Email & 🔔 Notification Logic =====================

# Manually trigger email reminders (3-week / 1-week) for harvest
routes.route("/send-email-reminder", methods=["POST"])(check_and_send_reminders)

# Manually trigger notification generation (3-week / 1-week) based on plant age
routes.route("/generate-notifications", methods=["POST"])(generate_notifications)
# Checks for unread notifications for the authenticated user
routes.route("/check-unread-notifications", methods=["POST"])(check_unread_notifications)
# Retrieves all notifications for the authenticated user
routes.route("/get_user_notifications", methods=["GET"])(get_user_notifications)
