const connection = require('../mySQL');
const Chat = require('../models/chatroom');

// ------------------------------  booking table  ------------------------------------
const yourBooking = (req, res) => {
  const userId = req.body.userId;

  const getBooking = `SELECT 
    p.name,
    data.booking_id,
    data.max_available_seats,
    data.reserved_passengers,
    data.starting_time,
    data.pickup_location,
    data.dropoff_location,
    BookingStatus(data.ride_status) AS booking_status
  FROM passenger p JOIN
    ( SELECT * 
    FROM booking b JOIN ride r 
    USING (driver_id, starting_time) 
    WHERE b.passenger_id = ?) data 
  ON p.user_id = data.driver_id 
  ORDER BY data.ride_status, data.starting_time DESC;`;

  connection.query(getBooking, [userId], (err, result) => {
    if (err) {
      res.status(400).send(err);
      return;
    }

    res.json(result);
  });
};

const genBook = (req, res) => {
  const createBook = 'call generateBook(?, ?, ?, ?, ?, ?)';

  const passenger_id = req.body.passenger_id;
  const driver_id = req.body.driver_id;
  const starting_time = req.body.starting_time;
  const pickup_location = req.body.pickup_location;
  const dropoff_location = req.body.dropoff_location;
  const seat = req.body.seat;

  // format time before query mySql
  const startTime = new Date(starting_time)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  connection.query(
    createBook,
    [
      passenger_id,
      driver_id,
      startTime,
      pickup_location,
      dropoff_location,
      seat,
    ],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      res.json(result);
    }
  );
};

const deleteBook = (req, res) => {
  const delBooking = 'call cancelBook(?)';

  const bookingID = req.body.bookingID;
  connection.query(delBooking, bookingID, (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.json(result);
  });
};

// ------------------------------  ride table  ------------------------------------
const create_ride = (req, res) => {
  try {
    const { driverName, driverId, startingTime, route, maxSeats } = req.body;

    // Create new chat room
    const title = driverName + "'s Ride";
    const chatroom = new Chat({ title });
    const chatId = chatroom._id.toString();

    // prase data to its correct type
    const starting_time = new Date(startingTime)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const max_available_seats = Number(maxSeats);
    const driver_id = Number(driverId);

    // Insert new ride to database
    const query = `INSERT INTO ride (driver_id, starting_time, chat_id, route, ride_status, max_available_seats)\
        VALUES(?, ?, ?, ?, 'available', ?)`;
    connection.query(
      query,
      [driver_id, starting_time, chatId, route, max_available_seats],
      (err, result) => {
        if (err) {
          console.log(err.message);
          if (err.message.includes('ER_DUP_ENTRY'))
            res.status(400).send('Aready have ride at this time');
          else res.sendStatus(401);
          return;
        }

        chatroom
          .save()
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(400));
      }
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
    return;
  }
};

const find_rides = (req, res) => {
  try {
    let { userId, startingTime, endTime, requestSeats } = req.body;
    // change js date format to mysql date formant
    startingTime = new Date(startingTime).toISOString().slice(0, 10);
    endTime = new Date(endTime).toISOString().slice(0, 10);
    requestSeats = Number(requestSeats);

    console.log(startingTime, ' ', endTime);
    const query = `SELECT 
        p.name,
        r.driver_id,
        r.max_available_seats,
        r.reserved_passengers,
        r.starting_time,
        r.route
    FROM passenger p
    JOIN(
      SELECT *
      FROM ride temp
      WHERE ride_status = 'available'
        AND DATE_FORMAT(starting_time, '%Y-%m-%d') BETWEEN ? AND ?
        AND IsRideFull(?, reserved_passengers, max_available_seats)
        AND driver_id != ?
        AND NOT EXISTS (
          SELECT *
          FROM booking b
          WHERE b.passenger_id = ? AND b.driver_id = r.driver_id AND b.starting_time = temp.starting_time
        )
        ) r
    ON p.user_id = r.driver_id
    ORDER BY r.starting_time;`;

    connection.query(
      query,
      [startingTime, endTime, requestSeats, userId, userId],
      (err, result) => {
        if (err) {
          res.sendStatus(404);
          return;
        }

        res.json(result);
      }
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
};

const get_your_rides = (req, res) => {
  const id = req.query.id;

  const yourRides = `SELECT route, starting_time, max_available_seats, reserved_passengers, ride_status\
    FROM ride\
    WHERE driver_id = ?\
    ORDER BY ride_status, starting_time DESC`;

  connection.query(yourRides, [id], (err, result) => {
    if (err) {
      res.sendStatus(404);
      return;
    }

    res.json(result);
  });
};

module.exports = {
  yourBooking,
  genBook,
  deleteBook,
  create_ride,
  get_your_rides,
  find_rides,
};
