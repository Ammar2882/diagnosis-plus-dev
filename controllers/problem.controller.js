const Problem = require('../models/Problem');
const Patient = require('../models/Patient');
const ErrorResponse = require('../utils/errorResponse');
const { getPatientNames } = require('../helpers/helpers')

exports.getAllProblems = async (req, res, next) => {
    try {
        const problems = await Problem.find();
        if (problems.length === 0) {
            res.status(200).json({
                success: true,
                data: "no previous problems found"
            });
        } else {
            res.status(200).json({
                success: true, data: problems
            });
        }
    } catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }
}

exports.getDocProblems = async (req, res, next) => {
    try {
        console.log("getting doctor specific problems")
        const userIds = await Problem.find({ 'doctorId': req.user.data[1] }).distinct('patientID');

        if (userIds.length === 0) {
            res.status(200).json({
                success: true,
                data: "no previous problems found"
            });
        } else {
            const resProblems = []
            for (i = 0; i < userIds.length; i++) {
                const NAMEpatient = await getPatientNames(userIds)
                resProblems.push({
                    patientId: userIds[i],
                    patientName: NAMEpatient
                }
                )
            }
            res.status(200).json({
                success: true, data: resProblems
            });
        }
    } catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }
}

exports.getProblems = async (req, res, next) => {

    try {
        const problems = await Problem.find({ 'patientID': req.user.data[1] });
        if (problems.length === 0) {
            res.status(200).json({
                success: true,
                data: "no previous problems found"
            });
        } else {
            res.status(200).json({
                success: true, count: problems.length, data: problems
            });
        }
    } catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }

}

exports.setProblems = async (req, res, next) => {
    try {
        const problem = new Problem({
            patientID: req.user.data[1],
            doctorId: req.body.doctorId,
            fullBodyCoordinates: req.body.fullBodyCoordinates,
            symptoms: req.body.symptoms,
            symptomsStarted: req.body.symptomsStarted,
            symptomsDevelop: req.body.symptomsDevelop,
            "injury.isInjury": req.body.isInjury,
            "injury.Details": req.body.injuryDetails,
            symptomsDuration: req.body.symptomsDuration,
            symptomsAtBest: req.body.symptomsAtBest,
            symptomsAtWorst: req.body.symptomsAtWorst,
            "symptomsRadiation.isRadiate": req.body.isRaditate,
            "symptomsRadiation.radiateAt": req.body.radiateAt,
            "symptomsRadiation.radiateDetails": req.body.radiateDetails,
            radiationDistribution: req.body.radiationDistribution,
            aggravatingFactors: req.body.aggravatingFactors,
            alleviatingFactors: req.body.alleviatingFactors,
            "previousTreatment.isPreviousTreatment": req.body.isPreviousTreatment,
            "previousTreatment.previousTreatmentInclude": req.body.previousTreatmentInclude,
            "previousTreatment.otherTreatments": req.body.otherTreatments,
            "currentIssueMedications.currentMedications": req.body.currentMedications,
            "currentIssueMedications.painMedications": req.body.painMedications,
            "currentIssueMedications.newMedications": req.body.newMedications,
            createdAt: req.body.createdAt,
            isChecked: false,
        });
        const p = await Patient.findOne({ '_id': req.user.data[1] });
        problem.patientName = `${p.fname} ${p.lname}`;
        const result = await problem.save();
        res.status(200).json({
            success: true,
            message: 'problem added successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}