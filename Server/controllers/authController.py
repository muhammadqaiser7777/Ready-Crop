from datetime import datetime
from flask import request, jsonify # type: ignore
from config.supabaseConfig import supabase
from config.mailConfig import generate_otp
from middleware.encrypt import hash_password, hash_otp, check_otp, check_password
from middleware.authToken import generate_auth_token
from email_validator import validate_email, EmailNotValidError # type: ignore
import os
import random


# Load environment variable
BACKEND_URL = os.getenv("Backend_URL")

ALLOWED_FIELDS_FOR_SIGNUP = {"full_name", "email", "password", "gender"}

BACKEND_URL = os.getenv("Backend_URL")

def signup():
    """Handles user signup with proper exception handling."""
    try:
        print("Signup function called.")
        try:
            data = request.get_json()
        except Exception:
            return jsonify({"error": "Invalid JSON format"}), 400

        print("Received signup request.")

        # Check for extra fields
        extra_fields = set(data.keys()) - ALLOWED_FIELDS_FOR_SIGNUP
        if extra_fields:
            return jsonify({"error": f"Unexpected fields provided: {list(extra_fields)}"}), 400

        # Extract and validate required fields
        full_name = data.get("full_name")
        email = data.get("email")
        password = data.get("password")
        gender = data.get("gender")
        otp_purpose = "Verification"
        status = "Pending"

        if not all([full_name, email, password, gender]):
            return jsonify({"error": "Full name, email, password, and gender are required"}), 400

        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters long"}), 400

        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({"error": "Invalid email format"}), 400

        try:
            existing_user = supabase.table("users").select("id").eq("email", email).execute()
            if existing_user.data:
                return jsonify({"error": "Email is already registered"}), 400
        except Exception:
            return jsonify({"error": "Database error while checking existing user"}), 500

        valid_genders = {"male", "female", "other"}
        gender = gender.lower()
        if gender not in valid_genders:
            return jsonify({"error": "Gender must be male, female, or other"}), 400

        print(f"Generating OTP for {email}")
        otp = generate_otp(email, otp_purpose)
        if not otp:
            return jsonify({"error": "Failed to send OTP email"}), 500

        # Select profile picture
        if gender == "male":
            filename = f"{random.randint(1, 15)}.png"
            path = f"static/public/Avatars/male-avatars/{filename}"
        elif gender == "female":
            filename = f"{random.randint(1, 15)}.png"
            path = f"static/public/Avatars/female-avatars/{filename}"
        else:
            filename = "other_avatar.png"
            path = f"static/public/Avatars/{filename}"

        profile_pic_db_path = path  # saved to DB

        # Add backend URL to send full path in response
        profile_pic_response = f"{BACKEND_URL}{path.lstrip('/')}"

        hashed_password = hash_password(password)
        hashed_otp = hash_otp(otp)
        auth_token = generate_auth_token(email)

        try:
            response = supabase.table("users").insert({
                "email": email,
                "full_name": full_name,
                "password": hashed_password,
                "profile_pic": profile_pic_db_path,
                "gender": gender,
                "status": status,
                "otp": hashed_otp,
                "otp_purpose": otp_purpose,
                "auth_token": auth_token
            }).execute()
        except Exception:
            return jsonify({"error": "Database error while registering user"}), 500

        print("User registered successfully!")
        return jsonify({
            "message": "User registered successfully",
            "auth_token": auth_token,
            "email": email,
            "status": status,
            "profile_pic": profile_pic_response,
            "full_name": full_name
        }), 201

    except Exception as e:
        print(f"Unexpected signup error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


    

def verify():
    """Handles OTP verification with proper exception handling."""
    try:
        try:
            data = request.get_json()
        except Exception:
            return jsonify({"error": "Invalid JSON format"}), 400

        required_keys = {"email", "auth_token", "otp"}
        if not required_keys.issubset(data.keys()):
            return jsonify({"error": "Missing required fields: email, auth_token, and OTP"}), 400

        email = data["email"]
        auth_token = data["auth_token"]
        otp = data["otp"]

        # Validate email format
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({"error": "Invalid email format"}), 400

        try:
            user_response = supabase.table("users").select("*").eq("email", email).execute()
        except Exception:
            return jsonify({"error": "Database error while fetching user"}), 500

        if not user_response.data:
            return jsonify({"error": "User does not exist"}), 400

        user = user_response.data[0]  # Since email is unique, there will be only one record

        if auth_token != user.get("auth_token"):
            return jsonify({"error": "Invalid token"}), 400

        if user.get("status") == "Verified":
            return jsonify({"error": "User already verified"}), 400

        current_time = datetime.utcnow()
        otp_expiry = user.get("otp_expiry")
        if otp_expiry:
            try:
                if current_time > datetime.fromisoformat(otp_expiry):
                    return jsonify({"error": "Your OTP has expired, please regenerate OTP"}), 400
            except ValueError:
                return jsonify({"error": "Invalid OTP expiry format in database"}), 500

        if not check_otp(otp, user.get("otp")):
            return jsonify({"error": "Invalid OTP"}), 400

        try:
            supabase.table("users").update({
                "status": "Verified",
                "otp": None,
                "otp_purpose": None,
                "otp_expiry": None
            }).eq("email", email).execute()
        except Exception:
            return jsonify({"error": "Database error while updating user status"}), 500

        return jsonify({"message": "OTP verified successfully, status updated to Verified"}), 200

    except Exception as e:
        print(f"Unexpected verification error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


def login():
    """Handles user login with improved error handling."""
    try:
        try:
            data = request.get_json()
        except Exception:
            return jsonify({"error": "Invalid JSON format"}), 400

        # Ensure required fields are present
        required_fields = {"email", "password"}
        if not required_fields.issubset(data.keys()):
            return jsonify({"error": "Missing required fields: email and password"}), 400

        email = data.get("email")
        password = data.get("password")

        # Validate email format
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({"error": "Invalid email format"}), 400

        try:
            user_response = supabase.table("users").select("*").eq("email", email).execute()
        except Exception:
            return jsonify({"error": "Database error while fetching user"}), 500

        if not user_response.data:
            return jsonify({"error": "User not found"}), 400

        user = user_response.data[0]

        # Check password using check_password from auth.py
        if not check_password(password, user["password"]):
            return jsonify({"error": "Invalid credentials"}), 400

        auth_token = user.get("auth_token")
        if auth_token is None:
            print(f"Generating new auth_token for {email}")
            auth_token = generate_auth_token(email)

            try:
                supabase.table("users").update({"auth_token": auth_token}).eq("email", email).execute()
            except Exception:
                return jsonify({"error": "Database error while updating auth token"}), 500

        # Prepend Backend_URL to profile_pic if needed
        profile_pic = user.get("profile_pic")
        if profile_pic and not profile_pic.startswith("http"):
            profile_pic = f"{BACKEND_URL}{profile_pic.lstrip('/')}"

        response_data = {
            "email": user["email"],
            "gender": user["gender"],
            "full_name": user["full_name"],
            "profile_pic": profile_pic,
            "auth_token": auth_token,
            "status": user["status"]
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500



def logout():
    """Handles user logout with improved error handling."""
    try:
        try:
            data = request.get_json()
        except Exception:
            return jsonify({"error": "Invalid JSON format"}), 400

        # Ensure required fields are present
        required_fields = {"email", "auth_token"}
        if not required_fields.issubset(data.keys()):
            return jsonify({"error": "Missing required fields: email and auth_token"}), 400

        email = data.get("email")
        auth_token = data.get("auth_token")

        # Validate email format
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({"error": "Invalid email format"}), 400

        try:
            user_response = supabase.table("users").select("*").eq("email", email).execute()
        except Exception:
            return jsonify({"error": "Database error while fetching user"}), 500

        if not user_response.data:
            return jsonify({"error": "User not found"}), 400

        user = user_response.data[0]

        # Check if the auth_token matches the stored token
        if auth_token != user.get("auth_token"):
            return jsonify({"error": "Invalid auth token"}), 400

        try:
            supabase.table("users").update({"auth_token": None}).eq("email", email).execute()
        except Exception:
            return jsonify({"error": "Database error while updating auth token"}), 500

        return jsonify({"message": "Logout successful"}), 200

    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500