const io = require('../../index');

exports.listenForConnection = () => {
  io.io.on('connection', (socket) => {
    console.log('made socket connection');
  });
};
