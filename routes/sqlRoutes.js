const express = require('express');
const sqlController = require('../controllers/sqlController');
const router = express.Router();

router.post('/rides', sqlController.yourRide);
router.post('/books', sqlController.yourBooking);
router.post('/bookRide', sqlController.genBook);

module.exports = router;
