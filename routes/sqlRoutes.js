const express = require('express');
const sqlController = require('../controllers/sqlController');
const router = express.Router();

router.post('/rides', sqlController.yourRide);

module.exports = router;
