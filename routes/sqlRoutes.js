const express = require('express');
const sqlController = require('../controllers/sqlController');
const router = express.Router();

router.post('/rides', sqlController.yourRide);
router.post('/book', sqlController.yourBooking);

module.exports = router;
