const express = require('express');
const mongoose = require('mongoose');
const connection = require('./mySQL');
const cors = require('cors');

const chatRoutes = require('./routes/chatroomRoutes');
const sqlRoutes = require('./routes/sqlRoutes');

// environment variable
require('dotenv').config();

// process.env.PORT
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------  Database connection  ------------------------------------

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log('connected to mongodb');
    // listen for requests
  })
  .catch((err) => console.log(err.message));

connection.getConnection((err, connect) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected to mySQL');
  connect.release();
});

// routes
app.use('/api/chat', chatRoutes);
app.use('/api/', sqlRoutes);

app.get('/test', (req, res) => {
  res.send('Hello World');
});

// login route
app.post('/api/login', (req, res) => {
  const data = req.body;
  const query =
    'SELECT\
    p.user_id,\
    p.name,\
    p.gender,\
    p.birth_date,\
    p.phone_number,\
    p.email,\
    p.money_amount,\
    d.license_plate\
  FROM passenger p LEFT JOIN driver d\
  ON p.user_id = d.user_id WHERE P.user_id = ?';

  connection.query(query, [data.userId], (err, result) => {
    if (err) {
      console.log(err.message);
      res.status(404).send('Error');
      return;
    }
    if (result && result.length > 0) {
      console.log('UserId', data.userId, 'has just login');
      res.json(result[0]);
      return;
    }
    res.status(401).send('Not found');
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// ----------------------------------------------------------------------------------------
