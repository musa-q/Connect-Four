import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { useNavigate } from "react-router-dom";

import './game.css';

const Spectator = ({ socket }) => {
    const navigate = useNavigate();

    const [winner, setWinner] = useState(null);
    const [players, setPlayers] = useState([null, null]);
    const [turnMessage, setTurnMessage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [boardEmpty, setBoardEmpty] = useState(true);

    const [board, setBoard] = useState(() => {
        const initialBoard = [];
        for (let row = 0; row < 7; row++) {
            initialBoard.push(new Array(6).fill(null));
        }
        return initialBoard;
    });

    useEffect(() => {
        if (socket) {
            if (boardEmpty) {
                socket.emit('spectate_join');
            }
        }
    }, []);


    useEffect(() => {
        if (socket) {

            if (players[0] === null) {
                socket.emit("get_current_players_name");
            }

            socket.on('response_spectate_join', (data) => {
                const newBoard = [...board];
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 6; j++) {
                        newBoard[i][j] = data[j][i];
                    }
                }
                setBoard(newBoard);
                setBoardEmpty(false);
            });


            socket.on('response_current_players_name', (data) => {
                setTurnMessage(data["first"]);
                // console.log(data);
            });


            socket.on('game_board_update', (data) => {
                const newBoard = [...board];
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 6; j++) {
                        newBoard[i][j] = data["board"][j][i];
                    }
                }
                setBoard(newBoard);

                setTurnMessage(data["next_player"]);
                console.log(players);
            });

            socket.on('game_over', (data) => {
                setWinner(data["winner"]);
                setModalOpen(true);
            });

            return () => {
                if (socket) {
                    socket.off('game_board_update');
                    socket.off('game_over');
                }
            };
        } else {
            navigate(`/`);
        }
    }, [socket, board, winner, players, modalOpen, turnMessage, boardEmpty]);

    const handleWinSubmit = () => {
        socket.emit('return_home');
        navigate(`/`);
    }

    const renderPopUp = () => {
        if (winner != null) {
            return (
                <Modal
                    title={<h1>WINNER IS {winner}</h1>}
                    centered
                    closeIcon={false}
                    open={modalOpen}
                    footer={null}
                    maskClosable={false}
                >
                    <Button onClick={handleWinSubmit}>
                        RETURN TO HOME
                    </Button>

                </Modal>
            )
        }
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
            {renderPopUp()}
            {winner && <p>WINNER: {winner}</p>}
            {turnMessage && !winner && <p>It is {turnMessage} turn</p>}
            <div className='container'>
                <div className="game-container">
                    {renderBoard()}
                </div>
            </div>
        </>
    );
};

export default Spectator;
