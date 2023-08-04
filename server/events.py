from flask import Flask, request
from flask_socketio import emit, join_room, leave_room

from .extensions import socketio
from .manager import userManager, roomManager, add_room_user


@socketio.on("connect")
def handle_connect():
    print("CLIENT CONNECTED")


# @socketio.on("test")
# def test(data):
#     print("\nID", data, "\n")
#     user = userManager.get_user(request.sid)
#     emit("test_response", {"username": user.name, "room": user.room.roomID}, room=user.room.roomID)


@socketio.on("user_join")
def handle_user_join(payload):
    tempUsername = payload['username'].upper()
    tempRoomID = payload['room'].upper()
    success = add_room_user(tempUsername, request.sid, tempRoomID) # (tempUser, tempRoom)

    if success[1] == None:
        emit("add_user_response", {"response": "Room is already full."})
    else:
        print("JOINING ROOM ID", tempRoomID)
        join_room(tempRoomID)
        emit("add_user_response", {"response": "User ADDED.", "gameID": tempRoomID, "error": False})
        if (success[1].users["first"] != None) and (success[1].users["second"] != None):
            emit("all_players_join", room=tempRoomID)


@socketio.on("get_start_turn")
def handle_user_join():
    user = userManager.get_user(request.sid)
    current_room = user.room
    curr = True if current_room.current_player == user else False
    emit("response_start_turn", {"curr": curr})


@socketio.on('make_move')
def on_make_move(data):
    user = userManager.get_user(request.sid)
    current_room = user.room

    if current_room:
        if (current_room.users["first"] == None) and (current_room.users["second"] == None):
            return
        if (current_room.current_player == user) and (not current_room.end):
            current_room.handle_make_move(data)
            emit('game_board_update', current_room.game.board, room=current_room.roomID)
    else:
        print("Room not found.")