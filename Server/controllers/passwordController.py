from flask import request, jsonify  # type: ignore
from middleware.encrypt import check_password, hash_password
from config.supabaseConfig import supabase
from config.mailConfig import confirmation, generate_otp
from datetime import datetime, timedelta
from middleware.encrypt import hash_otp, check_otp  # Import the hash_otp function
from middleware.authToken import generate_temp_token
from datetime import datetime, timedelta
import re

def change_password():
    """Changes the user's password if the provided credentials are correct."""
    try:
        required_fields = {"email", "auth_token", "password", "new_password"}
        data = request.get_json()
        
        if not data or not required_fields.issubset(data.keys()):
            return jsonify({"error": "Missing required fields"}), 400
        
        if set(data.keys()) != required_fields:
            return jsonify({"error": "Unexpected fields in request"}), 400
        
        email = data["email"]
        auth_token = data["auth_token"]
        password = data["password"]
        new_password = data["new_password"]
        
        # Validate password strength
        if len(new_password) < 8:
            return jsonify({"error": "New password must be at least 8 characters long "}), 400
        
        # Fetch user by email
        response = supabase.table("users").select("*").eq("email", email).execute()
        user = response.data[0] if response.data else None
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if user["auth_token"] != auth_token:
            return jsonify({"error": "Invalid authentication token"}), 401
        
        if not check_password(password, user["password"]):
            return jsonify({"error": "Invalid password"}), 401
        
        if check_password(new_password, user["password"]):
            return jsonify({"error": "New password cannot be the same as the existing password"}), 400
        
        # Hash new password and update in database
        hashed_new_password = hash_password(new_password)
        update_response = supabase.table("users").update({"password": hashed_new_password}).eq("email", email).execute()
        
        if not update_response.data:
            return jsonify({"error": "Failed to update password"}), 500
        
        # Send confirmation email
        if not confirmation(email):
            return jsonify({"error": "Failed to send confirmation email"}), 500
        
        return jsonify({"message": "Password changed successfully"}), 200
    
    except Exception as e:
        print(f"Error in change_password: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


def password_forget():
    """Handles OTP generation for password reset."""
    try:
        data = request.get_json()
        if not data or "email" not in data:
            return jsonify({"error": "Missing required fields"}), 400

        email = data["email"]

        # Validate email format
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email):
            return jsonify({"error": "Invalid email format"}), 400

        # Fetch user details
        response = supabase.table("users").select("*").eq("email", email).execute()
        user = response.data[0] if response.data else None

        if not user:
            return jsonify({"error": "User not found"}), 404

        otp_purpose = "Password Change"
        otp_expiry = (datetime.utcnow() + timedelta(minutes=3)).isoformat()

        # Generate OTP first before updating the database
        otp_response = generate_otp(email, "Password Change")
        if not isinstance(otp_response, str) or not otp_response:
            return jsonify({"error": "Failed to generate OTP"}), 500

        hashed_otp = hash_otp(otp_response)

        # Update all required fields in a single query
        update_response = supabase.table("users").update({
            "otp": hashed_otp,
            "otp_purpose": otp_purpose,
            "otp_expiry": otp_expiry
        }).eq("email", email).execute()

        if not update_response.data:
            return jsonify({"error": "Failed to update OTP details"}), 500

        return jsonify({"message": "OTP sent successfully"}), 200

    except Exception as e:
        print(f"Error in password_forget: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500



def verify_identity():
    """Verifies user identity using email and OTP."""
    try:
        data = request.get_json()
        if not data or set(data.keys()) != {"email", "otp"}:
            return jsonify({"error": "Invalid request format. Provide only 'email' and 'otp'."}), 400

        email = data["email"]
        otp = data["otp"]

        # Retrieve user data
        response = supabase.table("users").select("otp, otp_purpose, otp_expiry").eq("email", email).execute()
        if not response.data:
            return jsonify({"error": "User not found."}), 404

        user = response.data[0]
        hashed_otp = user.get("otp")
        otp_purpose = user.get("otp_purpose")
        otp_expiry_str = user.get("otp_expiry")

        if not hashed_otp or not otp_purpose or not otp_expiry_str:
            return jsonify({"error": "OTP verification failed due to missing data."}), 400

        # Convert otp_expiry from string to datetime
        try:
            otp_expiry = datetime.fromisoformat(otp_expiry_str)
        except ValueError:
            return jsonify({"error": "Invalid OTP expiry format."}), 500

        # Check if OTP is expired
        if datetime.utcnow() > otp_expiry:
            return jsonify({"error": "OTP has expired. Request a new one."}), 400

        # Verify OTP
        if not check_otp(otp, hashed_otp):
            return jsonify({"error": "Invalid OTP. Please try again."}), 400

        # Ensure OTP purpose is for password change
        if otp_purpose != "Password Change":
            return jsonify({"error": "OTP is not valid for this operation."}), 400

        # Generate temporary token
        temp_token, expiry_time = generate_temp_token(email)

        # Update database with temp_token and temp_token_expiry
        update_response = supabase.table("users").update({
            "temp_token": temp_token,
            "temp_token_expiry": expiry_time
        }).eq("email", email).execute()

        if not update_response.data:
            return jsonify({"error": "Failed to update temporary token."}), 500

        return jsonify({"email": email, "temp_token": temp_token}), 200

    except Exception as e:
        print(f"Error in verify_identity: {str(e)}")
        return jsonify({"error": "Internal server error."}), 500

    

def set_new_password():
    """Sets a new password for the user if the temp token is valid."""
    try:
        data = request.get_json()
        if not data or set(data.keys()) != {"email", "temp_token", "new_password"}:
            return jsonify({"error": "Invalid request format. Provide 'email', 'temp_token', and 'new_password'."}), 400

        email = data["email"]
        temp_token = data["temp_token"]
        new_password = data["new_password"]

        # Retrieve user data
        response = supabase.table("users").select("password, temp_token, temp_token_expiry").eq("email", email).execute()
        if not response.data:
            return jsonify({"error": "User not found."}), 404

        user = response.data[0]
        stored_temp_token = user.get("temp_token")
        temp_token_expiry_str = user.get("temp_token_expiry")
        current_password = user.get("password")

        if not stored_temp_token or not temp_token_expiry_str:
            return jsonify({"error": "Temporary token verification failed."}), 400

        # Validate temp_token
        if stored_temp_token != temp_token:
            return jsonify({"error": "Invalid temporary token."}), 400

        # Validate temp_token expiry
        try:
            temp_token_expiry = datetime.fromisoformat(temp_token_expiry_str)
        except ValueError:
            return jsonify({"error": "Invalid temporary token expiry format."}), 500

        if datetime.utcnow() > temp_token_expiry:
            return jsonify({"error": "Temporary token has expired. Request a new one."}), 400

        # Ensure new password is different from the old one
        if check_password(new_password, current_password):
            return jsonify({"error": "New password cannot be the same as the current password."}), 400

        # Ensure password meets security standards (length, complexity, etc.)
        if len(new_password) < 8:
            return jsonify({"error": "Password must be at least 8 characters long."}), 400

        # Hash new password
        hashed_password = hash_password(new_password)

        # Update database with new password and remove temp values
        update_response = supabase.table("users").update({
            "password": hashed_password,
            "temp_token": None,
            "temp_token_expiry": None
        }).eq("email", email).execute()

        if not update_response.data:
            return jsonify({"error": "Failed to update password. Please try again."}), 500

        return jsonify({"message": "Password updated successfully."}), 200
    
    except Exception as e:
        print(f"Error in set_new_password: {str(e)}")
        return jsonify({"error": "Internal server error."}), 500
