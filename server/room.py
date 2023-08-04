from .board import Board
import datetime
from flask_socketio import emit


class Room:
    def __init__(self, roomID, playerOne=None, playerTwo=None, isRed=True):
        self.roomID = roomID.upper()
        self.users = {"first": playerOne, "second": playerTwo}
        self.isRed = isRed
        self.game = Board(isRed)
        self.timeCreated = datetime.datetime.now()
        self.current_player = self.users["first"]
        self.end = False

    def switch_player(self):
        if self.current_player == self.users["first"]:
            self.current_player = self.users["second"]
        else:
            self.current_player = self.users["first"]

    # def play(self):
    #     game_over = False

    #     while not game_over:
    #         self.game.display()

    #         while True:
    #             try:
    #                 move = int(
    #                     input(f"Player {self.current_player.name}, enter your move (column number): "))
    #                 if self.game.is_valid_move(move):
    #                     break
    #                 else:
    #                     print("Invalid move. Please choose an available column.")
    #             except ValueError:
    #                 print("Invalid input. Please enter a valid column number.")

    #         piece = 'red' if self.current_player == self.users["first"] else 'yellow'
    #         self.game.drop_piece(move, piece)

    #         if self.game.check_winner('red' if self.current_player == self.users["first"] else 'yellow'):
    #             self.game.display()
    #             print(f"Player {self.current_player.name} wins!")
    #             game_over = True
    #             break

    #         if self.game.is_full():
    #             self.game.display()
    #             print("It's a draw!")
    #             game_over = True
    #             break
    #         self.switch_player()

    def handle_make_move(self, data):
        if 'move' in data:
            move = int(data['move'])
            if self.game.is_valid_move(move):
                piece = 'red' if self.current_player == self.users["first"] else 'yellow'
                self.game.drop_piece(move, piece)

                # emit('game_board_update', self.game.board,
                #      room=self.roomID)

                if self.game.check_winner(piece):
                    self.end = True
                    emit('game_over', {
                         'winner': self.current_player.name}, room=self.roomID)

                if self.game.is_full():
                    self.end = True
                    emit('game_over', {'winner': "Draw"},
                         room=self.roomID)

                self.switch_player()
                print(self.current_player.name)
