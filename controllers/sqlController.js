const connection = require('../mySQL');

const yourRides =
  'SELECT route, starting_time, ride_status, max_available_seats, reserved_passengers FROM ride WHERE driver_id = ?;';

const getBooking = `SELECT p.name, data.max_available_seats, data.reserved_passengers, data.starting_time, data.pickup_location,
  data.dropoff_location, CASE WHEN data.ride_status IN ('available', 'full') THEN 'booked'WHEN data.ride_status = 'cancelled' THEN 'ride cancel' ELSE data.ride_status END AS booking_status FROM passenger p JOIN( SELECT * FROM booking b JOIN ride r USING (driver_id, starting_time) WHERE b.passenger_id = ?) data ON p.user_id = data.driver_id;`;

const createBook = 'call generateBook(?, ?, ?, ?, ?, ?)';

const yourRide = (req, res) => {
  const id = req.body.id;

  connection.query(yourRides, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.json(result);
  });
};

const yourBooking = (req, res) => {
  const userId = req.body.userId;

  connection.query(getBooking, [userId], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.json(result);
  });
};

const genBook = (req, res) => {
  const passenger_id = req.body.passenger_id;
  const driver_id = req.body.driver_id;
  const starting_time = req.body.starting_time;
  const pickup_location = req.body.pickup_location;
  const dropoff_location = req.body.dropoff_location;
  const seat = req.body.seat;

  connection.query(
    createBook,
    [
      passenger_id,
      driver_id,
      starting_time,
      pickup_location,
      dropoff_location,
      seat,
    ],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      console.log('completed');
      res.json(result);
    }
  );
};

module.exports = { yourRide, yourBooking, genBook };
