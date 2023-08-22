import React, { useState, useEffect } from 'react';
import { Button, Modal, Space, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from "react-router-dom";

import './game.css';

const Game = ({ socket }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [currentTurn, setCurrentTurn] = useState(null);
    const [winner, setWinner] = useState(null);
    const [opponentsName, setOpponentsName] = useState(null);
    const [turnMessage, setTurnMessage] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [secondPlayerJoined, setSecondPlayerJoined] = useState(false);
    const [isRed, setIsRed] = useState(null);



    const [board, setBoard] = useState(() => {
        const initialBoard = [];
        for (let row = 0; row < 7; row++) {
            initialBoard.push(new Array(6).fill(null));
        }
        return initialBoard;
    });

    // useEffect(() => {
    //     // if (socket) {
    //     //     socket.emit('enter_page', );
    //     // }
    //     const pathnameParts = location.pathname.split('/');
    //     const roomId = pathnameParts[pathnameParts.length - 1];
    //     console.log("Room ID:", roomId);
    // });



    useEffect(() => {
        if (socket) {
            socket.emit('client_joined');

            socket.on('all_players_join', () => {
                if (currentTurn === null) {
                    socket.emit("get_current_players_name");
                    socket.emit("get_start_turn");
                }
                setSecondPlayerJoined(true);
            });

            socket.on('response_current_players_name', (data) => {
                setOpponentsName(data["opponent"]);
            });

            socket.on('response_start_turn', (data) => {
                setCurrentTurn(data["curr"]);
                if (data["curr"]) {
                    setCurrentTurn("your");
                    if (isRed === null) {
                        setIsRed(true);
                    }
                }
                else {
                    setCurrentTurn(opponentsName);
                    if (isRed === null) {
                        setIsRed(false);
                    }
                }
            });

            socket.on('game_board_update', (data) => {
                const newBoard = [...board];
                for (let i = 0; i < 7; i++) {
                    for (let j = 0; j < 6; j++) {
                        newBoard[i][j] = data["board"][j][i];
                    }
                }
                setBoard(newBoard);
                setCurrentTurn(!currentTurn);
                if (turnMessage === opponentsName) {
                    setTurnMessage("your");
                } else {
                    setTurnMessage(opponentsName);
                }
            });

            socket.on('game_over', (data) => {
                setCurrentTurn(false);
                setWinner(data["winner"]);
                setModalOpen(true);
            });

            return () => {
                if (socket) {
                    socket.off('game_board_update');
                    socket.off('game_over');
                    socket.off('response_start_turn');
                }
            };
        } else {
            navigate(`/`);
        }
    }, [currentTurn, socket, board, winner, modalOpen, secondPlayerJoined, isRed]);


    const handleWinSubmit = () => {
        socket.emit('return_home');
        navigate(`/`);
    }


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
            <div className='container'>
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
                                        if (currentTurn === "your") {
                                            handleMove(colIndex);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    return (
        <>
            {renderPopUp()}
            {console.log(currentTurn)}
            <div className="page-row">
                <div className="page-column left">
                    <div className='user-box'>
                        {currentTurn != null ? (
                            <>
                                <div className='content-row top' style={{ padding: "20px" }}>
                                    {isRed ? (<p>YOU</p>) : (opponentsName)}
                                </div>
                                <div className='content-row bottom'>
                                    {isRed ? (
                                        <>
                                            {currentTurn === "your" ? (
                                                <div className='turn-icon' style={{ backgroundColor: "rgba(255, 34, 34, 0.852)" }} />
                                            ) : (
                                                <div className='turn-icon' style={{ backgroundColor: "rgba(255, 34, 34, 0.2)" }} />
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {currentTurn === "your" ? (
                                                <div className='turn-icon' style={{ backgroundColor: "rgba(255, 34, 34, 0.2)" }} />
                                            ) : (
                                                <div className='turn-icon' style={{ backgroundColor: "rgba(255, 34, 34, 0.852)" }} />
                                            )}
                                        </>
                                    )}

                                </div>
                            </>
                        ) : (
                            <div />
                        )}

                    </div>
                </div>
                <div className="page-column middle">
                    <div className='content-row top'>
                        <div className='gamecode'>Connect Four</div>
                    </div>
                    <div className='content-row bottom'>
                        <div className='mainscreen'></div>
                        {secondPlayerJoined ?
                            (
                                renderBoard()
                            ) : (
                                <div className="loading-icon">
                                    <Space direction='vertical' >
                                        <Spin tip="Searching for a game" size="large" >
                                            <div className='loading-content' />
                                        </Spin>
                                    </Space>
                                </div>
                            )}
                    </div>
                </div>
                <div className="page-column right">
                    <div className='user-box'>
                        {currentTurn != null ? (
                            <>
                                <div className='content-row top' style={{ padding: "20px" }}>
                                    {!isRed ? (<p>YOU</p>) : (opponentsName)}
                                </div>
                                <div className='content-row bottom'>
                                    {!isRed ? (
                                        <>
                                            {currentTurn === "your" ? (
                                                <div className='turn-icon' style={{ backgroundColor: "rgba(255, 245, 46, 0.852)" }} />
                                            ) : (
                                                <div className='turn-icon' style={{ backgroundColor: "rgba(255, 245, 46, 0.2)" }} />
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {currentTurn === "your" ? (
                                                <div className='turn-icon' style={{ backgroundColor: "rgba(255, 245, 46, 0.2)" }} />
                                            ) : (
                                                <div className='turn-icon' style={{ backgroundColor: "rgba(255, 245, 46, 0.852)" }} />
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div />
                        )}

                    </div>
                </div>
            </div>
        </>
    );
};

export default Game;
