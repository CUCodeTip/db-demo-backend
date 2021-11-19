const connection = require('../db/mySQL');

const yourRides =
  'SELECT driver_id, route, starting_time, max_available_seats, reserved_passengers FROM ride WHERE driver_id = ?';

const yourRide = (req, res) => {
  const id = req.body.id;
  connection.query(yourRides, id, (err, result) => {
    if (err) {
      res.status(500);
      return;
    }

    res.json(result);
  });
};

module.exports = { yourRide };
