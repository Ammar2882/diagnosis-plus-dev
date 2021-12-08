const router = require("express").Router();
const Lab = require("../models/Lab");

//get all the labs
router.get('/', async (req, res) => {
    try {
        const labs = await Lab.find({})
        res.status(200).json({
            "success": true,
            "data": labs
        })
    }
    catch (e) {
        res.status(400).json({
            "success": false,
            "error": e
        })
    }
})

router.post('/setlab', async (req, res) => {
    try {
        const labs = new Lab({
            labs: req.body.labs
        })
        const saved = await labs.save()
        res.status(200).json({
            "success": true,
            "data": saved
        })
    }
    catch (e) {
        res.status(400).json({
            "success": false,
            "error": e
        })
    }
})

//set labs


module.exports = router;
