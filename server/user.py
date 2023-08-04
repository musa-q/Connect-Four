import datetime

class User:
    def __init__(self, username, id):
        self.name = username.upper()
        self.id = id
        self.timeCreated = datetime.datetime.now()
        self.room = None
