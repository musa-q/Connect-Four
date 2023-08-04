import random


class Board:
    def __init__(self, isRed):
        self.columns = 7
        self.rows = 6
        self.isRed = isRed
        self.board = [[None for _ in range(self.columns)] for _ in range(self.rows)]


    def is_full(self):
        for row in self.board:
            if None in row:
                return False
        return True

    def is_valid_move(self, col):
        if col < 0 or col >= self.columns:
            return False
        if self.board[0][col] != None:
            return False
        return True

    def drop_piece(self, col, piece):
        for row in range(self.rows - 1, -1, -1):
            if self.board[row][col] == None:
                self.board[row][col] = piece
                return True
        return False

    def remove_piece(self, col):
        for row in range(self.rows):
            if self.board[row][col] != None:
                self.board[row][col] = None
                break

    def check_winner(self, piece):
        # Check horizontal
        for row in range(self.rows):
            for col in range(self.columns - 3):
                if (
                    self.board[row][col] == piece
                    and self.board[row][col + 1] == piece
                    and self.board[row][col + 2] == piece
                    and self.board[row][col + 3] == piece
                ):
                    return True

        # Check vertical
        for row in range(self.rows - 3):
            for col in range(self.columns):
                if (
                    self.board[row][col] == piece
                    and self.board[row + 1][col] == piece
                    and self.board[row + 2][col] == piece
                    and self.board[row + 3][col] == piece
                ):
                    return True

        # Check diagonal (top-left to bottom-right)
        for row in range(self.rows - 3):
            for col in range(self.columns - 3):
                if (
                    self.board[row][col] == piece
                    and self.board[row + 1][col + 1] == piece
                    and self.board[row + 2][col + 2] == piece
                    and self.board[row + 3][col + 3] == piece
                ):
                    return True

        # Check diagonal (bottom-left to top-right)
        for row in range(3, self.rows):
            for col in range(self.columns - 3):
                if (
                    self.board[row][col] == piece
                    and self.board[row - 1][col + 1] == piece
                    and self.board[row - 2][col + 2] == piece
                    and self.board[row - 3][col + 3] == piece
                ):
                    return True

        return False


