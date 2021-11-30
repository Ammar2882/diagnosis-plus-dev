const express = require('express');
const TestDignosis = require('../models/TestDignosis')
const ErrorResponse = require('../utils/errorResponse')

const router = express.Router();


router.get('/', async (req, res, next) => {
    try {
        const result = await TestDignosis.find();
        res.send(result);
    } catch (err) {
        next(new ErrorResponse(err.message, 500))
    }

})

router.post('/', async (req, res, next) => {
    try {
        let d = new TestDignosis(req.body);
        console.log(d);
        let result = await d.save();

        res.send(result)

    } catch (err) {
        next(new ErrorResponse(err.message, 500))
    }
})

module.exports = router;