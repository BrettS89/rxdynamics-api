const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const cors = require('cors');
const keys = require('./src/config');

const transferRoutes = require('./src/routes/transferRequest');
const employeeRoutes = require('./src/routes/employee');
const appRoutes = require('./src/routes/app');

const socketIO = require('./src/services/socketIO');

const app = express();
app.use(cors());
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useNewUrlParser: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/transferrequest', transferRoutes);
app.use('/employee', employeeRoutes);
app.use('/', appRoutes);

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`server started on port ${port}`);
});

const io = socket(server);
exports.io = io;

socketIO.listenForConnection();