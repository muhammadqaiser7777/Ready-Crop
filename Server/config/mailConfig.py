import os
from flask import Flask # type: ignore
from flask_mail import Mail # type: ignore
from dotenv import load_dotenv # type: ignore
from flask_mail import Message # type: ignore
import re
import random 


# Load environment variables
load_dotenv()

app = Flask(__name__)

# Email Config (As Provided)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL') == 'True'

mail = Mail(app)

def generate_otp(recipient, otp_purpose):
    """Generates and sends OTP with enhanced validation."""
    try:
        # Validate recipient email format
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", recipient):
            print(f"Invalid recipient email: {recipient}")
            return None

        # Generate OTP
        otp = str(random.randint(100000, 999999))
        print(f"Generated OTP for {recipient}")

        # Email configuration
        email_templates = {
            "Verification": {
                "subject": "Verify Your Email - Ready Crop",
                "body": (
                    "Dear User,\n\n"
                    "Welcome to Ready Crop, your AI-powered harvest planner!\n\n"
                    "To complete your registration, please use the following verification code:\n\n"
                    "**{otp}**\n\n"
                    "This code will expire in 3 minutes (180 seconds). If you did not request this verification, please ignore this email.\n\n"
                    "Regards,\n"
                    "Ready Crop"
                )
            },
            "Password Change": {
                "subject": "Reset Your Password - Ready Crop",
                "body": (
                    "Dear User,\n\n"
                    "We received a request to reset your password. Use the following code to proceed:\n\n"
                    "**{otp}**\n\n"
                    "This code will expire in 3 minutes (180 seconds). If you did not request a password reset, please ignore this email.\n\n"
                    "Regards,\n"
                    "Ready Crop"
                )
            }
        }

        # Validate OTP purpose
        template = email_templates.get(otp_purpose)
        if not template:
            print(f"Invalid OTP purpose: {otp_purpose}")
            return None

        # Get sender email
        sender_email = os.getenv("MAIL_USERNAME")
        if not sender_email:
            print("MAIL_USERNAME is not configured!")
            return None

        # Create and send email
        msg = Message(
            subject=template["subject"],
            sender=sender_email,  # No extra parentheses needed
            recipients=[recipient],
            body=template["body"].format(otp=otp)  # Format OTP dynamically
        )

        mail.send(msg)
        print(f"OTP email sent successfully to {recipient}")
        return otp

    except Exception as e:
        print(f"Error in generate_otp: {str(e)}")
        return None
    

def generate_random_otp():
    """Generates a secure 6-digit OTP."""
    return str(random.randint(100000, 999999))

def regenerate_otp(recipient):
    """Regenerates and sends a new OTP to the recipient."""
    try:
        # Validate recipient email format
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", recipient):
            print(f"Invalid recipient email: {recipient}")
            return None

        # Generate new OTP
        otp = generate_random_otp()
        print(f"Regenerated OTP for {recipient}")

        # Get sender email
        sender_email = os.getenv("MAIL_USERNAME")
        if not sender_email:
            print("MAIL_USERNAME is not configured!")
            return None

        # Define email content
        email_template = {
            "subject": "Your New OTP - Ready Crop",
            "body": (
                "Dear User,\n\n"
                "As requested, here is your new one-time password (OTP):\n\n"
                "**{otp}**\n\n"
                "This OTP is valid for the next 3 minutes (180 seconds). If you did not request this, please disregard this email.\n\n"
                "Regards,\n"
                "Ready Crop"
            )
        }

        # Create and send email
        msg = Message(
            subject=email_template["subject"],
            sender=sender_email,  # Ensure correct sender format
            recipients=[recipient],
            body=email_template["body"].format(otp=otp)  # Format OTP dynamically
        )

        mail.send(msg)
        print(f"Regenerated OTP email sent successfully to {recipient}")
        return otp
    
    except Exception as e:
        print(f"Error in regenerate_otp: {str(e)}")
        return None
    


# Define email templates globally for reusability
EMAIL_TEMPLATES = {
    "confirmation": {
        "subject": "Your Password Has Been Changed - Ready Crop",
        "body": (
            "Dear User,\n\n"
            "Your password has been successfully changed. If you made this change, no further action is required.\n\n"
            "If you did not change your password, please contact our support team immediately.\n\n"
            "Regards,\n"
            "Ready Crop"
        )
    }
}

def confirmation(recipient):
    """Sends a confirmation email when the password is changed."""
    try:
        # Validate recipient email format
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", recipient):
            print(f"Invalid recipient email: {recipient}")
            return False

        # Get sender email from environment variables
        sender_email = os.getenv("MAIL_USERNAME")
        if not sender_email:
            print("MAIL_USERNAME is not configured!")
            return False

        # Ensure mail object exists
        if not mail:
            print("Mail instance is not initialized!")
            return False

        # Get email template
        template = EMAIL_TEMPLATES["confirmation"]

        # Create and send email
        msg = Message(
            subject=template["subject"],
            sender=sender_email,  # Ensure correct sender format
            recipients=[recipient],
            body=template["body"]
        )

        mail.send(msg)
        print(f"Confirmation email sent successfully to {recipient}")
        return True

    except AttributeError as e:
        print(f"AttributeError: {str(e)} - Possible issue with mail.send()")
        return False

    except Exception as e:
        print(f"Unexpected error in confirmation email: {str(e)}")
        return False


def send_three_week_reminder(recipient, plant_class):
    """Sends a reminder email 3 weeks before harvest."""
    try:
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", recipient):
            print(f"Invalid recipient email: {recipient}")
            return False

        sender_email = os.getenv("MAIL_USERNAME")
        if not sender_email:
            print("MAIL_USERNAME is not configured!")
            return False

        subject = "3 Weeks Until Harvest - Ready Crop"
        body = (
            f"Dear User,\n\n"
            f"Good news! Your plant is expected to be ready for harvest in approximately 3 weeks.\n\n"
            f"Keep monitoring your plant regularly, and stay tuned for more updates.\n\n"
            f"Regards,\n"
            f"Ready Crop"
        )

        msg = Message(
            subject=subject,
            sender=sender_email,
            recipients=[recipient],
            body=body
        )

        mail.send(msg)
        print(f"3-week harvest reminder sent to {recipient}")
        return True

    except Exception as e:
        print(f"Error in send_three_week_reminder: {str(e)}")
        return False


def send_one_week_reminder(recipient, plant_class):
    """Sends a reminder email 1 week before harvest."""
    try:
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", recipient):
            print(f"Invalid recipient email: {recipient}")
            return False

        sender_email = os.getenv("MAIL_USERNAME")
        if not sender_email:
            print("MAIL_USERNAME is not configured!")
            return False

        subject = "1 Week Until Harvest - Ready Crop"
        body = (
            f"Dear User,\n\n"
            f"This is a friendly reminder that your plant is expected to be ready for harvest in just 1 week!\n\n"
            f"Prepare your tools and get ready to harvest at the optimal time.\n\n"
            f"Regards,\n"
            f"Ready Crop"
        )

        msg = Message(
            subject=subject,
            sender=sender_email,
            recipients=[recipient],
            body=body
        )

        mail.send(msg)
        print(f"1-week harvest reminder sent to {recipient}")
        return True

    except Exception as e:
        print(f"Error in send_one_week_reminder: {str(e)}")
        return False
