from flask import Flask, request
from flask_socketio import emit, join_room, leave_room, close_room

from .extensions import socketio
from .manager import userManager, roomManager, add_room_user
from .user import User


@socketio.on("connect")
def handle_connect():
    print("CLIENT CONNECTED")


# @socketio.on("test")
# def test(data):
#     print("\nID", data, "\n")
#     user = userManager.get_user(request.sid)
#     emit("test_response", {"username": user.name, "room": user.room.roomID}, room=user.room.roomID)

@socketio.on('get_home')
def get_home():
    user = userManager.get_user(request.sid)
    val = None if user==None else user.name
    emit('home_user_response', {'user':val})

@socketio.on('return_home')
def return_home():
    user = userManager.get_user(request.sid)
    user.room = None

# @socketio.on('enter_page')
# def enter_page():
#     enter = False
#     try:
#         user = userManager.get_user(request.sid)
#         if user != None:
#             enter = True
#     except:
#         pass
#     emit('enter_page_response', enter)


@socketio.on('get_all_rooms')
def get_all_rooms():
    room_user = []
    all_rooms = roomManager.view_rooms()
    for room in all_rooms:
        room_user.append((room, roomManager.get_room(room).users["first"].name))
    emit("all_rooms_response", room_user)


@socketio.on("add_spectator")
def handle_spectator_join(payload):
    roomID = payload.upper()
    user = userManager.get_user(request.sid)

    roomManager.add_spectator(roomID, user)
    user.room = roomManager.get_room(roomID)
    join_room(roomID)


# when a user is created with the popup
# creates user
@socketio.on("user_join")
def handle_user_join(payload):
    tempUsername = payload['username'].upper()
    tempUser = User(str(tempUsername), request.sid)
    res = userManager.add_user(tempUser)
    emit("add_user_response", {"user": res})


# user creates a room
# checks for space in games
# creates room + adds user
@socketio.on("room_join")
def handle_room_join():
    user = userManager.get_user(request.sid)
    (created, roomID) = roomManager.online_game(user)
    join_room(roomID)
    emit("add_room_response", {"response": "User ADDED.", "gameID": roomID, "error": False}, room=roomID)
    if not created:
        emit("all_players_join", room=roomID)


@socketio.on("get_start_turn")
def handle_user_join():
    user = userManager.get_user(request.sid)
    current_room = user.room
    curr = True if current_room.current_player == user else False
    emit("response_start_turn", {"curr": curr})


@socketio.on("get_current_players_name")
def handle_current_players_name():
    user = userManager.get_user(request.sid)
    current_room = user.room
    # print("USER", user.name, "ROOM", current_room.roomID if current_room != None else None)
    username = current_room.users["second"].name if user == current_room.users["first"] else current_room.users["first"].name
    emit("response_current_players_name", {"opponent": username, "first":current_room.users["first"].name, "second":current_room.users["second"].name})


@socketio.on('spectate_join')
def spectate_join():
    user = userManager.get_user(request.sid)
    emit('response_spectate_join', user.room.game.board)


@socketio.on('make_move')
def on_make_move(data):
    user = userManager.get_user(request.sid)
    current_room = user.room

    if current_room:
        if (current_room.users["first"] == None) and (current_room.users["second"] == None):
            return
        if (current_room.current_player == user) and (not current_room.end):
            current_room.handle_make_move(data)
            emit('game_board_update', {"board":current_room.game.board, "next_player":current_room.current_player.name}, room=current_room.roomID)
            if current_room.end == True:
                # remve game from roomManager
                roomManager.all_rooms.pop(current_room.roomID)
                # remove user rooms
                for key, user in current_room.users.items():
                    user.room = None
                    # leave room players + spectators
                for user in current_room.spectators:
                    user.room = None
                    # leave room players + spectators
                close_room(current_room.roomID)

    else:
        print("Room not found.")