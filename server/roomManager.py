import random
import string

from .room import Room

class RoomManager:
    def __init__(self):
        self.all_rooms = {}

    def view_rooms(self):
        return list(self.all_rooms.keys())

    def get_available(self):
        for id, room in self.all_rooms.items():
            if room.available == True:
                return room
        return None

    def get_room(self, roomID):
        if roomID in self.all_rooms.keys():
            return self.all_rooms[roomID]
        return None

    def online_game(self, user): #returns True if room created
        toJoin = self.get_available()
        if toJoin == None:
            # create roomid + add user
            tempID = ''.join(random.choice(string.ascii_uppercase) for _ in range(4))
            while tempID in self.all_rooms:
                tempID = ''.join(random.choice(string.ascii_uppercase) for _ in range(4))
            tempRoom = Room(tempID, playerOne=user)
            self.all_rooms[tempID.upper()] = tempRoom
            user.room = tempRoom
            tempRoom.users["first"] = user
            return (True, tempID)
        else:
            # join room
            toJoin.users["second"] = user
            toJoin.available = False
            user.room = toJoin
            return (False, toJoin.roomID)


    def remove_room(self, removeRoom):
        removeRoom = removeRoom.upper()
        if removeRoom in self.all_rooms:
            print("Room removed")
            self.all_rooms.pop(removeRoom)
        else:
            print("Room does not exist - removing room", removeRoom)


    def add_spectator(self, roomID, user):
        room = self.all_rooms[roomID.upper()]
        room.spectators.append(user)

