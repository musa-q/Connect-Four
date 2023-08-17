
import { useState, useEffect } from 'react';
import { Button, Form, Input, Space, Row, Col, Card, List, Modal } from 'antd';
import { useNavigate } from "react-router-dom";


const Home = ({ socket }) => {
    const navigate = useNavigate();

    const [sessionId, setSessionId] = useState(null);
    const [username, setUsername] = useState(null);
    const [currentRooms, setCurrentRooms] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);


    useEffect(() => {
        if (socket) {
            socket.on('connect', () => {
                console.log('Socket connected');
                socket.emit('get_home');
            }); 3

            // socket.on('disconnect', () => {
            //     console.log('Socket disconnected');
            // });

            socket.on('all_rooms_response', (data) => {
                if (data.length != 0) {
                    setCurrentRooms(data);
                }
            });

            socket.on('home_user_response', (data) => {
                setUsername(data["user"]);
                if (data["user"] === null) {
                    setModalOpen(true);
                }

            });

            socket.on('add_user_response', (data) => {
                setUsername(data["user"]);
            });

            socket.on('add_room_response', (data) => {
                console.log(data)
                if (data["error"] === false) {
                    navigate(`/room/${data["gameID"]}`);
                }
            });

            const interval = setInterval(() => {
                try {
                    socket.emit('get_all_rooms');
                } catch (error) {
                    console.log(error);
                }
            }, 4000);

            // socket.on('test_response', (data) => {
            //     console.log(data);
            // });

            return () => {
                if (socket) {
                    // socket.disconnect();
                    // socket.off('connect');
                    // socket.off('disconnect');
                    socket.off('sid_response');
                    socket.off('add_user_response');
                    socket.off('home_user_response');
                    socket.off('add_room_response');
                    socket.off('all_rooms_response');
                    clearInterval(interval);
                    // socket.off('test_response');
                }
            };
        }
    }, [socket, username, modalOpen, currentRooms]);


    const handleSubmitOnline = () => {
        try {
            socket.emit('room_join');
        } catch (error) {
            console.log(error);
        }
    };

    const handleButton = (room) => {
        try {
            socket.emit('add_spectator', room[0]);
            navigate(`/spectate/${room[0]}`);
        } catch (error) {
            console.log(error);
        }
    }

    const handleUsernameSubmit = (username) => {
        console.log(username);
        try {
            socket.emit('user_join', username);
        } catch (error) {
            console.log(error);
        }
    }

    const renderPopUp = () => {
        if (username == null) {
            return (
                <Modal
                    title="Create user"
                    centered
                    closeIcon={false}
                    open={modalOpen}
                    footer={null}
                    maskClosable={false}
                >
                    <Form
                        onFinish={handleUsernameSubmit}
                    >
                        <Space size={'large'} align='center'>
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your room',
                                    },
                                ]}
                            >
                                <Input style={{ width: 200 }} />
                            </Form.Item>
                        </Space>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )
        }

    }

    const renderGames = () => {
        if (!currentRooms) {
            return (<div>There aren't any active rooms</div>);
        }

        return (
            <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={currentRooms}
                renderItem={(room) => (
                    <List.Item>
                        <Card title={
                            <>
                                <p>{`Room ID: ${room[0]}`}</p>
                                <p>Created by {room[1]}</p>
                            </>
                        }>
                            <Button onClick={() => { handleButton(room) }}>Spectate</Button>
                        </Card>
                    </List.Item>
                )}
            />
        );
    };



    return (
        <>
            {renderPopUp()}
            <h1>CONNECT FOUR</h1>
            <Button onClick={() => { handleSubmitOnline() }}>PLAY ONLINE</Button>

            {/* {sessionId && <p>Session ID: {sessionId}</p>}

                {addUserResponse && <p>Add User Response: {addUserResponse}</p>} */}

            {/* <Button onClick={handleButton}>GET ALL ROOMS</Button> */}

            {renderGames()}

        </>
    );
}

export default Home;