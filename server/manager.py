from .userManager import UserManager
from .roomManager import RoomManager
from .user import User


userManager = UserManager()
roomManager = RoomManager()


def add_room_user(username, userID, roomID):
    tempUser = User(str(username), userID)
    userManager.add_user(tempUser)
    tempRoom = roomManager.add_user_to_room(tempUser, roomID)
    return (tempUser, tempRoom)
