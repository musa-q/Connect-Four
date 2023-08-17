import { useState, useEffect } from 'react'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import './App.css'
import { ConfigProvider, theme } from 'antd';
import Home from './pages/Home';
import Game from './pages/Game';
import { Socket, io } from 'socket.io-client';
import Spectator from './pages/Spectator';


const App = ({ routes }) => {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const [isDarkMode, setIsDarkMode] = useState(true);


  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io(`http://127.0.0.1:5000`);
    newSocket.connect();
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" >
          <Route index element={<Home socket={socket} />} />
        </Route>
        <Route path="/room/:gameID" element={<Game socket={socket} />} />
        <Route path="/spectate/:gameID" element={<Spectator socket={socket} />} />
      </>
    )
  );

  return (
    <>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        }}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </>
  );
}

export default App;
