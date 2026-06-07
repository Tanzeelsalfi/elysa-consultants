from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from config.db import get_db

projects_bp = Blueprint("projects", __name__)


def serialize_doc(doc):
    if not doc:
        return doc
    doc["_id"] = str(doc["_id"])
    for key, val in doc.items():
        if isinstance(val, datetime):
            doc[key] = val.isoformat()
    return doc


@projects_bp.route("", methods=["GET"])
@projects_bp.route("/", methods=["GET"])
def get_projects():
    try:
        db = get_db()
        projects_cursor = db.projects.find().sort("createdAt", -1)
        projects_list = [serialize_doc(doc) for doc in projects_cursor]
        return jsonify(projects_list), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@projects_bp.route("/<id>", methods=["GET"])
def get_project(id):
    try:
        db = get_db()
        project = db.projects.find_one({"_id": ObjectId(id)})
        if not project:
            return jsonify({"message": "Project not found"}), 404
        return jsonify(serialize_doc(project)), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
