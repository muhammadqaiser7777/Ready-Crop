from flask_bcrypt import Bcrypt # type: ignore

bcrypt = Bcrypt()

def hash_password(password):
    """Hashes the given password and returns the hashed value."""
    return bcrypt.generate_password_hash(password).decode("utf-8")

def check_password(password, hashed_password):
    """Verifies if the provided password matches the hashed password."""
    return bcrypt.check_password_hash(hashed_password, password)

def hash_otp(otp):
    """Hashes the given OTP and returns the hashed value."""
    return bcrypt.generate_password_hash(otp).decode("utf-8")

def check_otp(otp, hashed_otp):
    """Verifies if the provided OTP matches the hashed OTP."""
    return bcrypt.check_password_hash(hashed_otp, otp)
