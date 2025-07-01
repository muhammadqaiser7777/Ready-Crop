from datetime import datetime, timezone, timedelta
from config.supabaseConfig import supabase
from config.mailConfig import send_three_week_reminder, send_one_week_reminder
from flask import jsonify # type: ignore

def check_and_send_reminders():
    """Checks plant records and sends reminder emails 3 or 1 weeks before harvest."""
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
            .select("id, class, created_at, owned_by, three_week_mail_sent, one_week_mail_sent") \
            .in_("class", valid_classes) \
            .execute()

        records = response.data

        for record in records:
            try:
                plant_class = record["class"]
                created_at = datetime.fromisoformat(record["created_at"].replace("Z", "+00:00"))
                user_id = record["owned_by"]
                three_week_sent = record.get("three_week_mail_sent", False)
                one_week_sent = record.get("one_week_mail_sent", False)

                # Calculate time left until 6-month harvest
                age_in_months = class_to_month.get(plant_class)
                if age_in_months is None:
                    continue

                age_days = age_in_months * 30
                time_until_harvest = timedelta(days=180 - age_days) - (datetime.now(timezone.utc) - created_at)

                # Get recipient email
                user_response = supabase.table("users") \
                    .select("email") \
                    .eq("id", user_id) \
                    .single() \
                    .execute()
                user_data = user_response.data
                if not user_data or "email" not in user_data:
                    continue

                recipient_email = user_data["email"]

                # Send 3-week reminder (20–22 days left)
                if timedelta(days=20) <= time_until_harvest <= timedelta(days=22) and not three_week_sent:
                    if send_three_week_reminder(recipient_email, plant_class):
                        supabase.table("plant_records").update({
                            "three_week_mail_sent": True
                        }).eq("id", record["id"]).execute()

                # Send 1-week reminder (6–8 days left)
                if timedelta(days=6) <= time_until_harvest <= timedelta(days=8) and not one_week_sent:
                    if send_one_week_reminder(recipient_email, plant_class):
                        supabase.table("plant_records").update({
                            "one_week_mail_sent": True
                        }).eq("id", record["id"]).execute()

            except Exception as e:
                print(f"⚠️ Error processing record ID {record.get('id')}: {str(e)}")

        print("✅ Reminder check completed successfully.")
        return jsonify({"message": "Reminder check completed"}), 200


    except Exception as e:
        print(f"❌ Error in check_and_send_reminders: {str(e)}")
