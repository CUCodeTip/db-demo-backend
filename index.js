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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------  Database connection  ------------------------------------

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log('connected to mongoDB');
    // listen for requests
  })
  .catch((err) => console.log(err.message));

const db = mysql.createConnection({
  host: mysqlHost,
  user: mysqlUser,
  password: mysqlPW,
  database: mysqlDB,
  port: mysqlPort,
  ssl: {
    ca: fs.readFileSync('./BaltimoreCyberTrustRoot.crt.pem'),
  },
});

db.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected to mySQL');
});

// routes
app.use('/api/chat', chatRoutes);

app.get('/test', (req, res) => {
  res.send('Hello World');
});

// login route
app.post('/api/login', (req, res) => {
  const data = req.body;
  db.query(
    'SELECT * FROM passenger P LEFT JOIN driver D\
     ON P.user_id = D.user_id WHERE P.user_id = ?',
    [data.userId],
    (err, result) => {
      if (err) {
        console.log(err.message);
        res.status(404).send('Error');
        return;
      }
      if (result && result.length > 0) {
        console.log(data.userId, 'has just login');
        res.json(result[0]);
        return;
      }
      res.status(401).send('Not found');
    }
  );
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// ----------------------------------------------------------------------------------------

const yourRides =
  'SELECT route, starting_time, max_available_seats, reserved_passengers FROM ride WHERE driver_id = ?';

app.post('/api/rides', (req, res) => {
  const id = req.body.id;

  connection.query(yourRides, id, (err, result) => {
    if (err) {
      res.status(500);
      return;
    }

    res.json(result);
  });
});
