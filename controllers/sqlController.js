const connection = require('../mySQL');
const Chat = require('../models/chatroom');

// ------------------------------  booking table  ------------------------------------
const getBooking = `SELECT p.name, data.max_available_seats, data.reserved_passengers, data.starting_time, data.pickup_location,
  data.dropoff_location, CASE WHEN data.ride_status IN ('available', 'full') THEN 'booked'WHEN data.ride_status = 'cancelled' THEN 'ride cancel' ELSE data.ride_status END AS booking_status FROM passenger p JOIN( SELECT * FROM booking b JOIN ride r USING (driver_id, starting_time) WHERE b.passenger_id = ?) data ON p.user_id = data.driver_id;`;

const yourBooking = (req, res) => {
  const userId = req.body.userId;

  connection.query(getBooking, [userId], (err, result) => {
    if (err) {
      res.status(400).send(err);
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
    const query =
      "INSERT INTO ride (driver_id, starting_time, chat_id, route, ride_status, max_available_seats)\
        VALUES(?, ?, ?, ?, 'available', ?)";
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
    let { startingTime, endTime, requestSeats } = req.body;

    // change js date format to mysql date formant
    startTime = new Date(startingTime)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    endTime = new Date(endTime).toISOString().slice(0, 19).replace('T', ' ');
    requestSeats = Number(requestSeats);

    const query =
      "SELECT\
          p.name,\
          r.driver_id,\
          r.max_available_seats,\
          r.reserved_passengers,\
          r.starting_time,\
          r.route\
      FROM passenger p\
      JOIN(\
          SELECT *\
          FROM ride\
          WHERE ride_status = 'available'\
              AND DATE_FORMAT(starting_time, '%Y-%m-%d') BETWEEN ? AND ?\
              AND (max_available_seats - reserved_passengers) >= ?\
          ) r\
      ON p.user_id = r.driver_id\
      ORDER BY r.starting_time";

    connection.query(
      query,
      [startTime, endTime, requestSeats],
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

  const yourRides =
    'SELECT route, starting_time, max_available_seats, reserved_passengers, ride_status\
    FROM ride\
    WHERE driver_id = ?\
    ORDER BY ride_status, starting_time';

  connection.query(yourRides, [id], (err, result) => {
    if (err) {
      res.sendStatus(404);
      return;
    }

    res.json(result);
  });
};

// -----------------------------------------------------------------------------
module.exports = { yourBooking, create_ride, get_your_rides, find_rides };
