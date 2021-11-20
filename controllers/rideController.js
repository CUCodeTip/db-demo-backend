const connection = require('../db/mySQL');
const Chat = require('../models/chatroom');

const create_ride = async (req, res) => {
  try {
    const { driverName, driverId, startingTime, route, maxSeats } = req.body;

    // Create new chat room
    const title = driverName + "'s Ride";
    const chatroom = new Chat({ title });
    await chatroom.save();
    const chatId = chatroom._id;

    // Insert new ride to database
    const query =
      "INSERT INTO ride (driver_id, starting_time, chat_id, route, ride_status, max_available_seats )\
        VALUES(?, ?, ?, ?, 'available', ?)";
    connection.query(
      query,
      [driverId, startingTime, chatId, route, maxSeats],
      (err, result) => {
        if (err) {
          res.sendStatus(401);
          return;
        }

        res.sendStatus(200);
      }
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(401);
    return;
  }
};

const find_rides = (req, res) => {
  let { startTime, endTime, requestSeats } = req.body;

  // change js date format to mysql date formant
  startTime = new Date(startTime).toISOString().slice(0, 19).replace('T', ' ');
  endTime = new Date(endTime).toISOString().slice(0, 19).replace('T', ' ');
  requestSeats = Number(requestSeats);

  const query =
    "SELECT\
          p.name,\
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
      ON p.user_id = r.driver_id";

  connection.query(query, [startTime, endTime, requestSeats], (err, result) => {
    if (err) {
      res.sendStatus(401);
      return;
    }

    res.json(result);
  });
};

const get_your_rides = (req, res) => {
  const id = req.query.id;

  const yourRides =
    'SELECT route, starting_time, max_available_seats, reserved_passengers, ride_status\
    FROM ride\
    WHERE driver_id = ?\
    ORDER BY ride_status DESC, starting_time DESC';

  connection.query(yourRides, [id], (err, result) => {
    if (err) {
      res.sendStatus(401);
      return;
    }

    res.json(result);
  });
};

module.exports = {
  create_ride,
  find_rides,
  get_your_rides,
};
