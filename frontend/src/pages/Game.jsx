import React, { useState, useEffect } from 'react';
import './game.css';

const Game = ({ socket }) => {
    const [currentPlayer, setCurrentPlayer] = useState('red');
    const [currentTurn, setCurrentTurn] = useState(null);
    const [winner, setWinner] = useState(null);

    const [board, setBoard] = useState(() => {
        const initialBoard = [];
        for (let row = 0; row < 7; row++) {
            initialBoard.push(new Array(6).fill(null));
        }
        return initialBoard;
    });


    useEffect(() => {
        if (socket) {

            socket.on('all_players_join', () => {
                if (currentTurn === null) {
                    socket.emit("get_start_turn");
                }
                console.log("Here")
            });
            socket.on('response_start_turn', (data) => {
                setCurrentTurn(data["curr"]);
                console.log(currentTurn)
            });

            socket.on('game_board_update', (data) => {
                const newBoard = [...board];
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 6; j++) {
                        newBoard[i][j] = data[j][i];
                    }
                }
                setBoard(newBoard);
                setCurrentTurn(!currentTurn);
            });

            socket.on('game_over', (data) => {
                setCurrentTurn(false);
                setWinner(data["winner"]);
            });

            return () => {
                if (socket) {
                    socket.off('game_board_update');
                    socket.off('game_over');
                    socket.off('response_start_turn');
                }
            };
        }
    }, [currentTurn, socket, board, winner]);



    const isColumnFull = (col) => {
        return board[col][0] !== null;
    }

    const handleMove = (col) => {
        if (isColumnFull(col)) {
            alert('Column is already full. Choose another column.');
            return;
        }

        socket.emit('make_move', { "move": col });;

    }


    const renderBoard = () => {
        return (
            <div className="board">
                {board.map((col, colIndex) => (
                    <div key={colIndex} className="col">
                        {col.map((cell, rowIndex) => (
                            <div
                                key={rowIndex}
                                className={`cell ${cell === 'red' ? 'red-piece' : (cell === 'yellow' ? 'yellow-piece' : '')}`}
                                data-row={rowIndex}
                                data-col={colIndex}
                                onClick={() => {
                                    if (currentTurn != null) {
                                        handleMove(colIndex);
                                    }
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    };


    return (
        <>
            <h1>Connect Four</h1>
            {winner && <p>WINNER: {winner}</p>}
            <div className='container'>
                <div className="game-container">
                    {renderBoard()}
                </div>
            </div>
        </>
    );
};

export default Game;
