const express = require('express');
const sqlController = require('../controllers/sqlController');
const router = express.Router();

router.post('/bookRide', sqlController.genBook);
router.post('/book', sqlController.yourBooking);
router.delete('/book', sqlController.deleteBook);
router.get('/rides', sqlController.get_your_rides);
router.post('/find-ride', sqlController.find_rides);
router.post('/rides/create', sqlController.create_ride);

module.exports = router;
