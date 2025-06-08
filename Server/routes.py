from flask import Blueprint # type: ignore
from controllers.authController import signup, verify, login, logout
from controllers.passwordController import change_password, password_forget,verify_identity, set_new_password
from controllers.otpController import otpRefresh, validate_otp
from controllers.predictController import predict_green_chilli
from controllers.plantRecordsController import savePlantRecord, deletePlantRecord

routes = Blueprint("routes", __name__)

# Signup route
routes.route("/signup", methods=["POST"])(signup)
routes.route("/verify", methods=["POST"])(verify)
routes.route("/login", methods=["POST"])(login)
routes.route("/logout", methods=["POST"])(logout)
routes.route("/change-password", methods=["POST"])(change_password)
routes.route("/password-forget", methods=["POST"])(password_forget)
routes.route("/otp-refresh", methods=["POST"])(otpRefresh)
routes.route("/validate-otp", methods=["POST"])(validate_otp)
routes.route("/verify-identity", methods=["POST"])(verify_identity)
routes.route("/set-new-password", methods=["POST"])(set_new_password)
routes.route("/predict-green-chilli", methods=["POST"])(predict_green_chilli)
routes.route("/save-plant-record", methods=["POST"])(savePlantRecord)
routes.route("/delete-plant-record", methods=["DELETE"])(deletePlantRecord)