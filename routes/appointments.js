const express = require('express');
const checkAuth = require('../middleware/check-auth');
const {
    getAllAppts,
    getAppts,
    setAppts
} = require('../controllers/appointments.controller');

const router = express.Router();

router.get('/getAllAppts', checkAuth, getAllAppts)
router.get('/getappointment', checkAuth, getAppts);
router.post('/setappointment', checkAuth ,setAppts);

module.exports = router;