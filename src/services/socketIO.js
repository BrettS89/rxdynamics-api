const io = require('../../index');

exports.listenForConnection = () => {
  io.io.on('connection', (socket) => {
    console.log('made socket connection');
  });

  io.io.on('disconnectt', (socket) => {
    socket.disconnect();
    console.log('a socket was disconnected');
  });
};
