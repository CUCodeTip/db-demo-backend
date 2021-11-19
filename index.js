const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql');
const cors = require('cors');
const fs = require('fs');

const chatRoutes = require('./routes/chatroomRoutes');

// environment variable
require('dotenv').config();

// process.env.PORT
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const mysqlHost = process.env.MYSQL_HOST;
const mysqlPort = process.env.MYSQL_PORT;
const mysqlUser = process.env.MYSQL_USER;
const mysqlPW = process.env.MYSQL_PASSWORD;
const mysqlDB = process.env.MYSQL_DB;

const app = express();

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log('connected to mongoDB');
    // listen for requests
  })
  .catch((err) => console.log(err.message));

const connection = mysql.createConnection({
  host: mysqlHost,
  user: mysqlUser,
  password: mysqlPW,
  database: mysqlDB,
  port: mysqlPort,
  ssl: {
    ca: fs.readFileSync('./BaltimoreCyberTrustRoot.crt.pem'),
  },
});

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected to mySQL');
});

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routes
app.use('/api/chat', chatRoutes);

app.get('/test', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
