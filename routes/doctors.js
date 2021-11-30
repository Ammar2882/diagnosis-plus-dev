const express = require('express');
const checkAuth = require('../middleware/check-auth')
const { getDoctorById,
    getDoctor,
    updateDoctor,
    deleteDoctor,
    registerDoctor,
    loginDoctor,
    searchCode,
    diagnosis,
    generateReport,
    getAllDoctors,
    getWaitingList,
    getPreviousAppointments
} = require('../controllers/doctors.controllers');


const router = express.Router();

router.get('/getDr', checkAuth, getDoctor);
router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.put('/updateDiagnosis/:pID', checkAuth, diagnosis);
router.get('/', checkAuth, getAllDoctors)
router.get('/getDr/:id', checkAuth, getDoctorById);
router.get('/report/:pID', generateReport);
router.get('/search', checkAuth, searchCode);
router.put('/updateDr', checkAuth, updateDoctor);
router.delete('/deleteDr', checkAuth, deleteDoctor);
router.get('/getWaiting', checkAuth, getWaitingList);
router.get('/prev', checkAuth, getPreviousAppointments)



module.exports = router;
