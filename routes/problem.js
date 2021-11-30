const express = require('express');
const checkAuth = require('../middleware/check-auth');
const {
    getProblems,
    setProblems,
    getAllProblems
} = require('../controllers/problem.controller');

const router = express.Router();

router.get('/', checkAuth, getProblems);
router.post('/', checkAuth, setProblems);
router.get('/all', getAllProblems)

module.exports = router;