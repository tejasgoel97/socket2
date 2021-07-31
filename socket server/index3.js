const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const firebase = require("firebase")
const {v4 : uuidv4} = require('uuid')



var firebaseConfig = {
  apiKey: "AIzaSyBP4jyBsYuxPF_9_YZ3kRTHOlWqUpyL858",
  authDomain: "chatapp-48dec.firebaseapp.com",
  databaseURL: "https://chatapp-48dec-default-rtdb.firebaseio.com",
  projectId: "chatapp-48dec",
  storageBucket: "chatapp-48dec.appspot.com",
  messagingSenderId: "885038298086",
  appId: "1:885038298086:web:c0fb0b159401fe5c455c27"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const httpServer = createServer();
// const firebaseUrl = "https://chatapp-48dec-default-rtdb.firebaseio.com/"
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io", "http://localhost:3001" ,  "http://localhost:3000"],
  }
});

function writeUserData(sessionID, name, socketId, userID) {
    console.log("writing to Firestore" )
  firebase.database().ref('users/' + sessionID).set({
    username: name,
    socketId,
    userID
  });
}
function findUserData(sessionID){
    console.log("getting the session")
    return firebase.database().ref('users/').get().then(snapshot=>{
        if(snapshot.exists()){
            const values = snapshot.val()
            if(values[sessionID]){
                // const values = value[sessionID]
                console.log("VALUES")
                console.log(values[sessionID])
                const session = {...values[sessionID] , sessionID}
                console.log("session")
                console.log(session)
                return session
            }
        
        }
    })
}
io.use(async (socket, next)=>{
  // console.log("Query: ",  socket.handshake.query.userId , socket.id)
  let sessionID = socket.handshake.auth?.sessionID;
  console.log("SessionId", sessionID)
  if(sessionID){
    const session = await findUserData(sessionID)
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username || "tejas";
  sessionID = uuidv4();
  let userID =uuidv4();
  socket.sessionID = sessionID
  socket.userID = uuidv4();
//   socket.username = username;   
//   console.log("socket.id", socket.id)
//   console.log("userID",  userID)
//   console.log("sessionID", sessionID)
//   console.log(sessionID, "userName", socket.id, userID) 
  writeUserData(sessionID, "userName", socket.id, userID) 
  next();
})


io.on('connection', (socket)=>{
    console.log("connected to ", socket.id)
    socket.join(socket.userID)
    // sending the sessionID and userID to the client
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
      });
    // end
    socket.on('chat message', (msg, recepient)=>{
        // const msg_new = "sent by Id: "+ socket.id + " userId: "+ socket.handshake.query.userId +"and message is " + msg
        // io.to(recepient).emit('chat message', msg_new)
        console.log(msg)
        io.emit("msg", msg);
    })

    socket.on("disconnect", (reason) => {
      console.log(reason); // "ping timeout"
    });
})
instrument(io, {
  auth: false
});

httpServer.listen(3001, ()=>{
  console.log("Now at 3000 port")
});


// ./emulator -port 9999 -avd emulator-5554