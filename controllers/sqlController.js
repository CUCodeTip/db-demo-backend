const connection = require('../mySQL');

const yourRides =
  'SELECT route, starting_time, ride_status, max_available_seats, reserved_passengers FROM ride WHERE driver_id = ?;';

const getBooking = `SELECT p.name, data.max_available_seats, data.reserved_passengers, data.starting_time, data.pickup_location,
  data.dropoff_location, CASE WHEN data.ride_status IN ('available', 'full') THEN 'booked'WHEN data.ride_status = 'cancelled' THEN 'ride cancel' ELSE data.ride_status END AS booking_status FROM passenger p JOIN( SELECT * FROM booking b JOIN ride r USING (driver_id, starting_time) WHERE b.passenger_id = ?) data ON p.user_id = data.driver_id;`;

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

module.exports = { yourRide, yourBooking };
