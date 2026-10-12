from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from app import db
from app.models import User
from app.utils.validators import current_user_id

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    """Community users self-register; admin/data_manager accounts are provisioned by an admin."""
    payload = request.get_json() or {}
    required = ["full_name", "email", "password"]
    if not all(payload.get(f) for f in required):
        return jsonify({"error": "full_name, email and password are required"}), 400

    if User.query.filter_by(email=payload["email"]).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    user = User(
        full_name=payload["full_name"],
        email=payload["email"],
        phone_number=payload.get("phone_number"),
        role="community_user",
    )
    user.set_password(payload["password"])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(
        identity=str(user.user_id), additional_claims={"role": user.role}
    )
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    payload = request.get_json() or {}
    user = User.query.filter_by(email=payload.get("email")).first()
    if not user or not user.check_password(payload.get("password", "")):
        return jsonify({"error": "Invalid email or password"}), 401
    if not user.is_active:
        return jsonify({"error": "This account has been deactivated"}), 403

    token = create_access_token(
        identity=str(user.user_id), additional_claims={"role": user.role}
    )
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.get("/me")
@jwt_required()
def me():
    user = User.query.get_or_404(current_user_id())
    return jsonify(user.to_dict())
