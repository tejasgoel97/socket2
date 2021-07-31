import "./App.css";
import { useRef, useState, useEffect, useCallback } from "react";
import Page from "./Page";
import socketClient from "socket.io-client";

const App = () => {
  const myref = useRef();
  const [userId, setUserId] = useState("");
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState([]);
  const connectUser = useCallback((userId) => {
    console.log("connecting to userId", userId);
    var socket = socketClient("http://localhost:3001", {
      query: {
        userId: userId,
      },
    });
    socket.on("connect", (sockett) => {
      console.log(`I'm connected with the back-end`, socket.id);
      console.log(sockett);
      setSocket(socket);
    });
    socket.on("chat message", (msg) => {
      console.log("got Message: ", msg);
      setMessage((message) => {
        message.push(msg);
        return message;
      });
      socket.emit("received message", msg.messageID);

      // socket.emit('received msg' , "messid");
    });
    return socket;
  }, []);
  useEffect(() => {
    let userID = localStorage.getItem("userId", userId);
    if(userID){
      setUserId(userID);
    }
    console.log("USERID IN LOCAKKSTORAGE" , userID)
  }, [setUserId]);
  useEffect(() => {
    console.log("trying to connect socket");
    if (userId) {
      localStorage.setItem("userId", userId)
      connectUser(userId);
      // if(sockettoSet){
      //   setSocket(sockettoSet)
      // }
    }
    return () => {
      socket?.disconnect(true);
    };
  }, [userId, connectUser]);
  if (!userId) {
    return (
      <>
        <input ref={myref}></input>
        <button onClick={() => setUserId(myref.current.value)}>Click</button>
      </>
    );
  }
  if (!socket) {
    return (
      <div>
        <h1>TRTING TO CONECT TO socket</h1>
      </div>
    );
  } else {
    return (
      <>
      <div className="text-align-right">

      <button className="btn btn-primary p-1" onClick={()=>{
        console.log("Setting userId")
        setUserId(null)
      }}>Logout</button>
      </div>
        <h1>{userId}</h1>
        <h2>Socket: {socket.id}</h2>
        <Page socket={socket} message={message} setMessage={setMessage} />
      </>
    );
  }
};
export default App;
