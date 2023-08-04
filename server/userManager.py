class UserManager:
    def __init__(self):
        self.all_users = {}

    def view_users(self):
        return list(self.all_users.keys())

    def add_user(self, newUser):
        if newUser.id in self.all_users:
            print("Username already exists")
        else:
            self.all_users[str(newUser.id)] = newUser

    def remove_user(self, removeUser):
        removeUser = removeUser.upper()
        if removeUser in self.all_users:
            self.all_users.pop(removeUser)
        else:
            print("User does not exist")

    def get_user(self, toFind):
        try:
            return self.all_users[toFind]
        except:
            return None

