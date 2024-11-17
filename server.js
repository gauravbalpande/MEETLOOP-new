// IMPORTS
require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const cors = require('cors')
app.use(cors())
const server = require("http").Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

const { v4: uuidV4 } = require('uuid')

const { ExpressPeerServer } = require("peer");
const { connectMongoDB } = require("./connect");
const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
  debug: true,
  cors: {
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST']
  }
});
const staticRoute = require("./routes/staticRoute");
const userRoute = require("./routes/userRoute");
const cookieParser = require("cookie-parser");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

// connection to database
connectMongoDB(process.env.Mongo_URL).then(() => {
  // console.log("MongoDB Connected");
});

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

//view engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// middlewares
app.use(express.static(path.resolve("public")));
app.use("/user", express.static(path.resolve("public")));
app.use("/peerjs", peerServer);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

// routes
app.use("/", staticRoute);
app.use("/user", userRoute);

// socket-io connections
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||3030)
