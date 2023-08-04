
import { useState, useEffect } from 'react';
import { Button, Form, Input, Space } from 'antd';
import { useNavigate } from "react-router-dom";


const Home = ({ socket }) => {
    const navigate = useNavigate();

    const [sessionId, setSessionId] = useState(null);
    const [addUserResponse, setAddUserResponse] = useState(null);

    useEffect(() => {
        if (socket) {
            socket.on('connect', () => {
                console.log('Socket connected');
            });

            // socket.on('disconnect', () => {
            //     console.log('Socket disconnected');
            // });

            socket.on('sid_response', (data) => {
                setSessionId(data.sid);
            });

            socket.on('add_user_response', (data) => {
                if (data["error"] === false) {
                    navigate(`/room/${data["gameID"]}`);
                }
            });

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
                    // socket.off('test_response');
                }
            };
        }
    }, [socket]);


    const handleSubmit = (vals) => {
        try {
            socket.emit('user_join', vals);
        } catch (error) {
            console.log(error);
        }
    };



    return (
        <>
            <h1>CONNECT FOUR</h1>
            <Form
                onFinish={handleSubmit}
            >

                <Space size={'large'} align='baseline'>
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your username',
                            },
                        ]}
                    >
                        <Input style={{ width: 200 }} />
                    </Form.Item>


                    <Form.Item
                        label="Room"
                        name="room"
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

            {/* {sessionId && <p>Session ID: {sessionId}</p>}

            {addUserResponse && <p>Add User Response: {addUserResponse}</p>} */}

        </>
    );
}

export default Home;