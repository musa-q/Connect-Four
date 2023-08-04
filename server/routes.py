from flask import Blueprint, jsonify

from .manager import userManager, roomManager, add_room_user


main = Blueprint("main", __name__)


@main.route("/")
def index():
    return "hi"


@main.route("/list-room-users")
def list_users():
    return jsonify({"rooms": roomManager.view_rooms(), "users": userManager.view_users()}), 200
