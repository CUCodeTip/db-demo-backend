const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql');
const fs = require('fs');
const chatRoutes = require('./routes/chatroomRoutes');

// enviroment variable
require('dotenv').config();

// process.env.PORT
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT;
const mysqlHost = process.env.MYSQL_HOST;
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
  port: port,
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

app.listen(3000);

// middlewares
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/chat', chatRoutes);
