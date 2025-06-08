from flask import request, jsonify  # type: ignore
from config.supabaseConfig import supabase
from datetime import datetime, timezone

def savePlantRecord():
    """Saves plant information if auth_token is valid, user is Verified, and plant_type is green_chilli."""
    try:
        try:
            data = request.get_json()
        except Exception:
            return jsonify({"error": "Invalid JSON format"}), 400

        required_fields = ["auth_token", "plant_type", "class", "confidence"]
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": f"Missing required fields: {', '.join(required_fields)}"}), 400

        auth_token = data["auth_token"]
        plant_type = data["plant_type"]
        plant_class = data["class"]
        confidence = data["confidence"]

        # Validate confidence
        try:
            confidence = float(confidence)
            if not (0 <= confidence <= 1):
                return jsonify({"error": "Confidence must be between 0 and 1"}), 400
        except ValueError:
            return jsonify({"error": "Confidence must be a number"}), 400

        # Check plant_type
        if plant_type.lower() != "green_chilli":
            return jsonify({"error": "Only 'green_chilli' plant type is supported"}), 400

        # Match user by auth_token and check status
        try:
            user_response = supabase.table("users") \
                .select("id", "status") \
                .eq("auth_token", auth_token) \
                .single() \
                .execute()
            user_data = user_response.data
        except Exception:
            return jsonify({"error": "Database error while verifying user"}), 500

        if not user_data or "id" not in user_data:
            return jsonify({"error": "Invalid auth_token"}), 401

        if user_data.get("status") != "Verified":
            return jsonify({"error": "User is not verified. Please verify your email before proceeding."}), 403

        user_id = user_data["id"]
        now_utc = datetime.now(timezone.utc).isoformat()

        # Insert plant record
        try:
            insert_response = supabase.table("plant_records").insert({
                "plant_type": plant_type,
                "class": plant_class,
                "confidence": confidence,
                "owned_by": user_id,
                "created_at": now_utc,
                "updated_at": now_utc
            }).execute()
        except Exception:
            return jsonify({"error": "Database error while saving plant record"}), 500

        return jsonify({"message": "Plant record saved successfully"}), 201

    except Exception as e:
        print(f"Error in savePlantRecord: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


def deletePlantRecord():
    """Deletes a plant record if the user is verified and owns the record."""
    try:
        try:
            data = request.get_json()
        except Exception:
            return jsonify({"error": "Invalid JSON format"}), 400

        required_fields = ["auth_token", "plant_id"]
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": f"Missing required fields: {', '.join(required_fields)}"}), 400

        auth_token = data["auth_token"]
        plant_id = data["plant_id"]

        # Match user by auth_token and check status
        try:
            user_response = supabase.table("users") \
                .select("id", "status") \
                .eq("auth_token", auth_token) \
                .single() \
                .execute()
            user_data = user_response.data
        except Exception:
            return jsonify({"error": "Database error while verifying user"}), 500

        if not user_data or "id" not in user_data:
            return jsonify({"error": "Invalid auth_token"}), 401

        if user_data.get("status") != "Verified":
            return jsonify({"error": "User is not verified. Please verify your email before proceeding."}), 403

        user_id = user_data["id"]

        # Check if the plant record exists and belongs to this user
        try:
            record_response = supabase.table("plant_records") \
                .select("id", "owned_by") \
                .eq("id", plant_id) \
                .single() \
                .execute()
            record_data = record_response.data
        except Exception:
            return jsonify({"error": "Database error while checking plant record"}), 500

        if not record_data:
            return jsonify({"error": "Plant record not found"}), 404

        if record_data.get("owned_by") != user_id:
            return jsonify({"error": "You are not authorized to delete this plant record"}), 403

        # Proceed to delete
        try:
            delete_response = supabase.table("plant_records") \
                .delete() \
                .eq("id", plant_id) \
                .execute()
        except Exception:
            return jsonify({"error": "Database error while deleting plant record"}), 500

        return jsonify({"message": "Plant record deleted successfully"}), 200

    except Exception as e:
        print(f"Error in deletePlantRecord: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
