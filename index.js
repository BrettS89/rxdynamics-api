const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const keys = require('./src/config');

const transferRoutes = require('./src/routes/transferRequest');
const employeeRoutes = require('./src/routes/employee');
const appRoutes = require('./src/routes/app');

const app = express();
app.use(cors());
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useNewUrlParser: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/transfer', transferRoutes);
app.use('/employee', employeeRoutes);
app.use('/', appRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
