from .room import Room


class RoomManager:
    def __init__(self):
        self.all_rooms = {}

    def view_rooms(self):
        return list(self.all_rooms.keys())

    def check_room_exists(self, roomID=None, room=None):
        if roomID is not None:
            check = roomID.upper()
            if check in self.all_rooms:
                return True
        if room is not None:
            check = room.roomID.upper()
            if check in self.all_rooms:
                return True
        return False

    def get_room(self, roomID):
        if roomID in self.all_rooms.keys():
            return self.all_rooms[roomID]
        return None

    def add_room(self, newRoomID, user):  # only accepts string ids
        if not self.check_room_exists(roomID=newRoomID):  # room doesnt exist
            self.all_rooms[newRoomID.upper()] = Room(newRoomID, playerOne=user)
            print("Room Created")
            return True
        else:
            print("Room ID exists - adding room", newRoomID)
            return False

    def remove_room(self, removeRoom):
        removeRoom = removeRoom.upper()
        if removeRoom in self.all_rooms:
            print("Room removed")
            self.all_rooms.pop(removeRoom)
        else:
            print("Room does not exist - removing room", removeRoom)

    def add_user_to_room(self, newUser, roomID):
        res = self.add_room(roomID, newUser)
        currRoom = self.all_rooms[roomID.upper()]

        if not res:  # if the room already exists
            # check if available for second player
            if currRoom.users["second"] == None:
                currRoom.users["second"] = newUser
                print("Player two added")
                newUser.room = currRoom
                return currRoom
            else:
                print("Player two exists in room", roomID)
                return None

        else:
            newUser.room = currRoom
            return currRoom
