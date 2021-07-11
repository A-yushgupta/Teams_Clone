const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
const { v4: uuidV4 } = require('uuid')
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const cors = require('cors');


app.set('view engine', 'ejs')
app.use(cors());
// app.use('peerjs',peerServer);
// Set static folder
app.use(express.static(path.join(__dirname, 'views')));

const botName = 'ChatCord Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );
    // changes
    function emitmess(){
    socket.broadcast
      .to(user.room)
      .emit(
        'Meeting started',
        formatMessage(botName, `${user.username} has started the chat`)
      );
    }
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});
console.log("YEAHO");
app.get('/',(req,res)=> {
  res.sendFile(__dirname + "/views/index.html");
  //  res.render('home');
});
app.get('/thanks',(req,res)=>{
  res.render('thanks');
})
app.get('/home',(req,res)=>{
  res.render('home');
})
app.get('/instantroom',(req,res)=>{
  res.render('instantroom');
})
app.get('/window.history.go(-1)',(req,res)=>{
  res.render('window.history.go(-1)');
})
app.get('/home', (req, res) => {
  res.render('home');
})
app.get('/room', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})


io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

const port=process.env.PORT||8000
server.listen(`${port}`)