const express = require('express');
const checkAuth = require('../middleware/check-auth');
const { getPatient,
    updatePatientInsurance,
    getPatients,
    createPatients,
    updatePatient,
    deletePatient,
    registerUser,
    loginUser,
    patientPhotoUpload,
    testUser,
    getMeds,
    getAllergies,
    getMedCondition,
    getSurgicalHistory,
    getFamilyHistory,
    getSocialHistory,
    getPharmacies,
    getInsuranceInfo,
    getAllPharmacies,
    getPharmacy,
    getOtherMeds,
    getPatientById,
    getPreviousTreatments } = require('../controllers/patients.controllers');


const router = express.Router();


router.get('/getAll', checkAuth, getPatients);
// .post(createPatients)
router.post('/register', registerUser);
router.post('/login', loginUser)

router.post('/test', testUser);

router.get('/getPatient', checkAuth, getPatient);
router.get('/getPatientById/:id', checkAuth, getPatientById);

router.patch('/updatePatient', checkAuth, updatePatient);
router.patch('/updatePatientInsurance', checkAuth, updatePatientInsurance);
//router.put('/:id/photo', patientPhotoUpload);
router.delete('/deletePatient', checkAuth, deletePatient);

//pharmacy routes
router.get('/getAllPharmacies', getAllPharmacies)
router.get('/getAllPharmacies/:name', getPharmacy)

//homepage routes for patient
router.get('/getMedications', checkAuth, getMeds);
router.get('/getAllergies', checkAuth, getAllergies);
router.get('/getMedCondition', checkAuth, getMedCondition);
router.get('/getSurgicalHistory', checkAuth, getSurgicalHistory);
router.get('/getFamilyHistory', checkAuth, getFamilyHistory);
router.get('/getSocialHistory', checkAuth, getSocialHistory);
router.get('/getPharmacies', checkAuth, getPharmacies);
router.get('/getInsuranceInfo', checkAuth, getInsuranceInfo);
router.get('/getInsuranceInfo', checkAuth, getInsuranceInfo);
router.get('/search', checkAuth, getOtherMeds);
router.get('/prev', checkAuth, getPreviousTreatments)

module.exports = router;