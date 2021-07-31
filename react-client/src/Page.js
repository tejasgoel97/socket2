import "./App.css";
import { useState } from "react";

function App({ socket, message, setMessage }) {
  // var socket = socketClient("http://localhost:3000");
  // socket.on("connection", () => {
  //   console.log(`I'm connected with the back-end`);
  // });
  const [inputt, setInputt] = useState("");
  const [recepient, setRecepient] = useState("");
  const clickHandler = (e) => {
    e.preventDefault();
    function ack(messageID){
      console.log("sent message received on server msgId", messageID)
      console.log(message)
      setMessage(msg=>{
        let msgIndex = msg.findIndex(m=>{
          return m.messageID === messageID 
        })
        console.log("message is at index :" ,msgIndex)
        msg[msgIndex].isSent = true
        // console.log(msg)
        return msg
      })
    }
    if (inputt) {
      let messageID = Date.now().toString() + "ok";
      const msg_new1 = {
        message: inputt,
        recepient: recepient,
        senderId: "me",
        messageID,
      };
      console.log("messageID", messageID)
      socket.emit("chat message", messageID, inputt, recepient, socket.id , ack.bind(this, messageID));
      setMessage(msg=>{
        msg.push(msg_new1)
        return msg
      })
      console.log("mesage sent: ", inputt);
    }
  };

  const setText = (val) => {
    setInputt(val.target.value);
  };
  // socket = fromJSON(toJSON(socket))
  return (
    <>
      <button
        onClick={() => {
          console.log(message);
        }}
      >
        socket
      </button>
      <ul id="messages">
        {message.map((m)=>{
        return(<li key={m.messageID}>
          <div className={`alert alert-primary text-right m-0 p-0 ${m.isSent ? "alert-success" :"alert-primary"}`} role="alert">
            {m.message}
            <p>
              {'from '+ m.senderId}
            </p>
          </div>
        </li>)
        })}
      </ul>
      <form id="form" action="">
        <input
          id="recepient"
          autoComplete="off"
          onChange={(text) => setRecepient(text.target.value)}
          value={recepient}
        />
        <input id="input" onChange={(text) => setText(text)} value={inputt} />
        <button onClick={clickHandler}>Send</button>
      </form>
    </>
  );
}

export default App;
