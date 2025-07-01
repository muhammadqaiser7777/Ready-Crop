from datetime import datetime, timezone, timedelta
from config.supabaseConfig import supabase
from flask import request, jsonify  # type: ignore

def generate_notifications():
    """Checks plant records and inserts notifications based on harvest timeline."""
    try:
        valid_classes = ["1 month", "2 month", "3 month", "4 month", "5 month"]
        class_to_month = {
            "1 month": 1,
            "2 month": 2,
            "3 month": 3,
            "4 month": 4,
            "5 month": 5,
        }

        response = supabase.table("plant_records") \
            .select("id, class, created_at") \
            .in_("class", valid_classes) \
            .execute()

        records = response.data

        for record in records:
            try:
                plant_id = record["id"]
                plant_class = record["class"]
                created_at = datetime.fromisoformat(record["created_at"].replace("Z", "+00:00"))

                age_in_months = class_to_month.get(plant_class)
                if age_in_months is None:
                    continue

                age_days = age_in_months * 30
                time_until_harvest = timedelta(days=180 - age_days) - (datetime.now(timezone.utc) - created_at)

                # Check if 3-week notification already exists
                notif_check = supabase.table("plant_notifications") \
                    .select("id") \
                    .eq("plant_id", plant_id) \
                    .eq("type", "three_week") \
                    .execute()

                if timedelta(days=20) <= time_until_harvest <= timedelta(days=22) and len(notif_check.data) == 0:
                    supabase.table("plant_notifications").insert({
                        "plant_id": plant_id,
                        "type": "three_week",
                        "is_read": False
                    }).execute()

                # Check if 1-week notification already exists
                notif_check = supabase.table("plant_notifications") \
                    .select("id") \
                    .eq("plant_id", plant_id) \
                    .eq("type", "one_week") \
                    .execute()

                if timedelta(days=6) <= time_until_harvest <= timedelta(days=8) and len(notif_check.data) == 0:
                    supabase.table("plant_notifications").insert({
                        "plant_id": plant_id,
                        "type": "one_week",
                        "is_read": False
                    }).execute()

            except Exception as e:
                print(f"Error processing plant_id {plant_id}: {str(e)}")

        print("Notification generation completed.")
        return jsonify({"message": "Notifications generation completed"}), 200


    except Exception as e:
        print(f"Error in generate_notifications: {str(e)}")


def check_unread_notifications():
    try:
        # Get the token from the request body (not headers)
        body = request.get_json()
        auth_token = body.get("auth_token")
        if not auth_token:
            return jsonify({"error": "auth_token missing in request body"}), 401

        # Look up the user using the auth_token
        user_response = supabase.table("users") \
            .select("id") \
            .eq("auth_token", auth_token) \
            .single() \
            .execute()

        user = user_response.data
        if not user:
            return jsonify({"error": "Invalid auth_token"}), 401

        user_id = user["id"]

        # Get plant records owned by this user
        plant_response = supabase.table("plant_records") \
            .select("id") \
            .eq("owned_by", user_id) \
            .execute()

        plant_ids = [p["id"] for p in plant_response.data]
        if not plant_ids:
            return jsonify({"unread_notifications": False}), 200

        # Check for any unread notifications
        notif_response = supabase.table("plant_notifications") \
            .select("id") \
            .in_("plant_id", plant_ids) \
            .eq("is_read", False) \
            .limit(1) \
            .execute()

        unread_exists = len(notif_response.data) > 0
        return jsonify({"unread_notifications": unread_exists}), 200

    except Exception as e:
        print(f"Error in check_unread_notifications: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


def get_user_notifications():
    try:
        # Get auth_token from request body
        body = request.get_json()
        auth_token = body.get("auth_token")
        if not auth_token:
            return jsonify({"error": "auth_token missing in request body"}), 401

        # Validate the user with the token
        user_response = supabase.table("users") \
            .select("id") \
            .eq("auth_token", auth_token) \
            .single() \
            .execute()

        user = user_response.data
        if not user:
            return jsonify({"error": "Invalid auth_token"}), 401

        user_id = user["id"]

        # Get all plant IDs owned by this user
        plant_response = supabase.table("plant_records") \
            .select("id, plant_type, class") \
            .eq("owned_by", user_id) \
            .execute()

        plants = plant_response.data
        if not plants:
            return jsonify({"read": [], "unread": []}), 200

        plant_map = {p["id"]: {"plant_type": p["plant_type"], "class": p["class"]} for p in plants}
        plant_ids = list(plant_map.keys())

        # Get all notifications for these plants
        notif_response = supabase.table("plant_notifications") \
            .select("id, plant_id, type, is_read, created_at") \
            .in_("plant_id", plant_ids) \
            .order("created_at", desc=False) \
            .execute()

        read = []
        unread = []
        unread_ids = []

        for notif in notif_response.data:
            plant_info = plant_map.get(notif["plant_id"], {})
            entry = {
                "id": notif["id"],
                "plant_id": notif["plant_id"],
                "type": notif["type"],  # 'three_week' or 'one_week'
                "created_at": notif["created_at"],
                "plant_type": plant_info.get("plant_type"),
                "class": plant_info.get("class")
            }
            if notif["is_read"]:
                read.append(entry)
            else:
                unread.append(entry)
                unread_ids.append(notif["id"])

        # Mark all unread notifications as read
        if unread_ids:
            supabase.table("plant_notifications") \
                .update({"is_read": True}) \
                .in_("id", unread_ids) \
                .execute()

        return jsonify({"read": read, "unread": unread}), 200

    except Exception as e:
        print(f"Error in get_user_notifications: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500