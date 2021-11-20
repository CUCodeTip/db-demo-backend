const express = require('express');
const rideController = require('../controllers/rideController');
const router = express.Router();

router.get('/rides', rideController.get_your_rides);
router.post('/find-ride', rideController.find_rides);
router.post('/rides/create', rideController.create_ride);

module.exports = router;
