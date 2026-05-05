const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const http = require('http');   
const { Server } = require('socket.io');
const mainSocketHandler = require('./server/sockets/main')

const app = express();
const PORT = 8030;
const server = http.createServer(app);      
const io = new Server(server);  


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main');
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./server/routes/api')(io));
app.use('/', require('./server/routes/main')(io));

io.on('connection', (socket) => {
    console.log(`[SOCKETIO] Client verbunden: ${socket.id}`);
    
    mainSocketHandler(io, socket);
    io.emit("lifecycle", {lfc: global.lifecycle});
    socket.on('disconnect', () => {
      console.log(`[SOCKETIO] Client getrennt: ${socket.id}`);
    });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[STATUS--] Frontend server running at http://localhost:${PORT}`);
});
