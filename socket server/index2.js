const { createServer, get } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const firebase = require("firebase");
const { v4: uuidv4 } = require("uuid");
const {
  addMessage,
  showMessage,
  deleteMessage,
} = require("./messages/chatmessages");

var firebaseConfig = {
  apiKey: "AIzaSyBP4jyBsYuxPF_9_YZ3kRTHOlWqUpyL858",
  authDomain: "chatapp-48dec.firebaseapp.com",
  databaseURL: "https://chatapp-48dec-default-rtdb.firebaseio.com",
  projectId: "chatapp-48dec",
  storageBucket: "chatapp-48dec.appspot.com",
  messagingSenderId: "885038298086",
  appId: "1:885038298086:web:c0fb0b159401fe5c455c27",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const httpServer = createServer();
// const firebaseUrl = "https://chatapp-48dec-default-rtdb.firebaseio.com/"
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://admin.socket.io",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    credentials: true,
  },
});

function writeUserData(userId, name, socketId, randomId) {
  firebase.database().ref("usersnew/" + userId)
    .set({
      username: name,
      socketId,
      randomId,
    });
}

function getUserData(userId) {
  return firebase.database()
    .ref().child("usersnew")
    .child(userId)
    .get()
    .then((snapshot) => { 
      if (snapshot.exists()) {
        console.log("USERID ", userId ,"-", snapshot.val());
        return snapshot.val()
      } else {

        console.log("No data available");
        return null
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
// io.engine.generateId = function (req) {
//   const newId = uuidv4()
//   console.log("generated uuid" , newId)
//   return newId
// }
getUserData("u1");

io.use((socket, next) => {
  // console.log("Query: ",  socket.handshake.query.userId , socket.id)
  getUserData(socket.handshake.query.userId).then(result=>{
    if (result){
      writeUserData(socket.handshake.query.userId, "userName", socket.id, uuidv4());
    }
    else{
      writeUserData(socket.handshake.query.userId, "userName", socket.id, uuidv4());
      console.log("will create new SocketId -> ",socket.handshake.query.userId )
    }
    next();
  })  
});
io.on("connection", (socket) => {
  console.log("connected to ", socket.id, socket.handshake.query);
  socket.join(socket.handshake.query.userId);
  socket.on("start new chat", () => {
    console.log("ok");
  });
  var startTime, endTime;

  socket.on("chat message", (messageID, msg, recepient, senderId, ack) => {
    const msg_new1 = {
      message: msg,
      recepient: recepient,
      senderId,
      messageID,
    };
    startTime = Date.now().toString();

    addMessage(messageID, senderId, recepient, msg);
    console.log("mesage_list", showMessage(), startTime);
    // io.emit('chat message', msg_new1);
    ack();
    socket.to(recepient).emit("chat message", msg_new1);
  });
  socket.on("received message", (messageID) => {
    console.log("message with Id received :", messageID);
    deleteMessage(messageID);
    endTime = Date.now().toString();
    let timeDiff = endTime - startTime;
    console.log("new message_list", showMessage(), endTime);
    console.log("time taken", startTime);
  });
  socket.emit("connected", "Its connected now");
  socket.on("disconnect", (reason) => {
    console.log(reason); // "ping timeout"
  });
});
var intervalId = setInterval(function () {
  function popOldMessageToFirebase() {
    let ItemList = showMessage();
    console.log("before delete: ", ItemList);
    for (const item in ItemList) {
      deleteMessage(item);
    }
    console.log("deleted array is :", showMessage());
  }
  popOldMessageToFirebase();
}, 10000);

instrument(io, {
  auth: false,
});

httpServer.listen(3001, () => {
  console.log("Now at 3000 port");
});
