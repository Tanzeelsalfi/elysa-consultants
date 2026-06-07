from flask import Blueprint, jsonify
from config.db import get_db

employees_bp = Blueprint("employees", __name__)

@employees_bp.route("", methods=["GET"])
@employees_bp.route("/", methods=["GET"])
def get_employees():
    try:
        db = get_db()
        employees_cursor = db.employees.find()
        employees_list = []
        for doc in employees_cursor:
            doc["_id"] = str(doc["_id"])
            employees_list.append(doc)
        return jsonify(employees_list), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
