const dgram = require('dgram');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const udpSocket = dgram.createSocket('udp4');

const UDP_PORT = 33333;
const HTTP_PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const miners = {};

// UDP Listener
udpSocket.on('error', (err) => {
  console.log(`UDP error:\n${err.stack}`);
  udpSocket.close();
});

udpSocket.on('message', (msg, rinfo) => {
  console.log(`UDP received: ${msg} from ${rinfo.address}:${rinfo.port}`);
  try {
    const data = JSON.parse(msg.toString());
    const id = data.id || rinfo.address;

    miners[id] = {
      ...data,
      lastSeen: Date.now(),
      ip: rinfo.address
    };

    io.emit('miner_update', miners[id]);
  } catch (e) {
    console.error('Invalid JSON from', rinfo.address, msg.toString());
  }
});

udpSocket.bind(UDP_PORT, () => {
  console.log(`UDP socket listening on port ${UDP_PORT}`);
});

// Clean up old miners
setInterval(() => {
  const now = Date.now();
  for (const id in miners) {
    if (now - miners[id].lastSeen > 30000) { // 30 seconds timeout
      console.log(`Miner ${id} timed out`);
      delete miners[id];
      io.emit('miner_remove', id);
    }
  }
}, 5000);

io.on('connection', (socket) => {
  socket.emit('init_miners', miners);
});

server.listen(HTTP_PORT, () => {
  console.log(`Dashboard running at http://localhost:${HTTP_PORT}`);
});
