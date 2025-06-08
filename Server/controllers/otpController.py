from flask import request, jsonify # type: ignore
from config.supabaseConfig import supabase
from config.mailConfig import regenerate_otp
from middleware.encrypt import hash_otp
from datetime import datetime, timedelta
from email_validator import validate_email, EmailNotValidError # type: ignore

def otpRefresh():
    """Handles OTP regeneration and updates database with improved error handling."""
    try:
        try:
            data = request.get_json()
        except Exception:
            return jsonify({"error": "Invalid JSON format"}), 400

        if not data or "email" not in data:
            return jsonify({"error": "Missing required field: email"}), 400

        email = data["email"]

        # Validate email format
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({"error": "Invalid email format"}), 400

        # Check if previous OTP exists
        try:
            response = supabase.table("users").select("otp", "otp_purpose").eq("email", email).single().execute()
            user_info = response.data  # Extract data correctly
        except Exception:
            return jsonify({"error": "Database error while retrieving OTP data"}), 500

        if not user_info or not user_info.get("otp") or not user_info.get("otp_purpose"):
            return jsonify({"error": "No previous OTP requests found to refresh"}), 400

        # Regenerate OTP
        new_otp = regenerate_otp(email)
        if not new_otp:
            return jsonify({"error": "Failed to generate OTP"}), 500

        hashed_otp = hash_otp(new_otp)
        otp_expiry = (datetime.utcnow() + timedelta(minutes=3)).isoformat()

        # Update database
        try:
            response = supabase.table("users").update({"otp": hashed_otp, "otp_expiry": otp_expiry}).eq("email", email).execute()
        except Exception:
            return jsonify({"error": "Database error while updating OTP"}), 500

        return jsonify({"message": "OTP regenerated successfully"}), 200

    except Exception as e:
        print(f"Error in otpRefresh: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


    

def validate_otp():
    """Checks if the OTP is still valid based on expiry time with improved error handling."""
    try:
        try:
            data = request.get_json()
        except Exception:
            return jsonify({"error": "Invalid JSON format"}), 400

        if not data or "email" not in data:
            return jsonify({"error": "Missing required field: email"}), 400

        email = data["email"]

        # Validate email format
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({"error": "Invalid email format"}), 400

        # Fetch OTP expiry time from database
        try:
            response = supabase.table("users").select("otp_expiry").eq("email", email).execute()
        except Exception:
            return jsonify({"error": "Database error while retrieving OTP expiry"}), 500

        if not response.data:
            return jsonify({"error": "User not found"}), 404

        otp_expiry = response.data[0]["otp_expiry"]

        try:
            expiry_time = datetime.fromisoformat(otp_expiry)
        except ValueError:
            return jsonify({"error": "Invalid OTP expiry format in database"}), 500

        if datetime.utcnow() < expiry_time:
            return jsonify({"message": "Valid", "otp_expiry": otp_expiry}), 200
        else:
            return jsonify({"message": "Expired"}), 200

    except Exception as e:
        print(f"Error in validate_otp: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
