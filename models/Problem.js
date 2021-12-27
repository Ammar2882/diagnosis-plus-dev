const mongoose = require('mongoose');

const ddschema = new mongoose.Schema({
    code: {
        type: String,

    },
    desc: {
        type: String,

    }
})


const specialTestSchema = new mongoose.Schema({
    bodyPart: String,
    test: [{
        testName: String,
        isLeftPass: {
            type: Boolean,

        },
        isRightPass: {
            type: Boolean,

        }
    }]

})

const strengthSchema = new mongoose.Schema({
    strengthName: {
        type: String

    },
    left: {
        type: Number,
        default: 0
    },
    right: {
        type: Number,
        default: 0

    }
})

const hpiProblemSchema = new mongoose.Schema({
    patientID: {
        type: String,
        required: [true, 'Please add a referral object id of the patient']
    },
    patientName: {
        type: String,
    },
    doctorId: {
        type: String,
    },
    isChecked: {
        type: Boolean
    },
    fullBodyCoordinates: {
        type: [String],
        required: [true, 'Please add the coordinates for full body 3d Model']
    },
    symptoms: {
        type: [String],
        required: [true, 'Please add symptoms for the problem you mentioned in full body 3D model']
    },
    symptomsStarted: {
        type: String,
        required: [true, 'Please add when did when symptoms started']
    },
    symptomsDevelop: {
        type: String,
        required: [true, 'Please enter how did the symptoms develop'],
        enum: ['gradually', 'suddenly']
    },
    injury: {
        isInjury: {
            type: Boolean,
            required: [false, 'Please enter whether you have injury or not'],
            default: false
        },
        Details: {
            type: String,
            required: false
        }
    },
    symptomsDuration: {
        type: String,
        required: [true, 'Please add the duration of symptoms']
    },
    symptomsAtBest: {
        type: String,
        required: [true, 'Please enter symptoms at best']
    },
    symptomsAtWorst: {
        type: String,
        required: [true, 'Please enter symptoms at worst']
    },
    symptomsRadiation: {
        isRadiate: {
            type: Boolean,
            required: [true, 'Please enter the choice of radiation'],
            default: false
        },
        radiateAt: {
            type: [String],

        },
        radiateDetails: {
            type: String,

        }
    },
    radiationDistribution: {
        type: [String],
        required: [true, 'Please add where is the radiation distribution in radiation 3d model']
    },
    aggravatingFactors: {
        type: [String],
        required: [true, 'Please enter aggravating factors']
    },
    alleviatingFactors: {
        type: [String],
        required: [true, 'Please enter alleviating factors']
    },
    previousTreatment: {
        isPreviousTreatment: {
            type: Boolean,
        },
        previousTreatmentInclude: {
            type: [String],

        },
        otherTreatments: {
            type: String,
            required: false,
        }

    },
    currentMedications: {
        type: [{
            name: String,
            dose: String,
            frequency: String,
            frequencyasneeded: String
        }],
        required: [true, 'Please add current medications'],
    },
    createdAt: {
        type: String,
    },
    dignosis: {
        vitals: {
            height: {
                type: Number
            },
            weight: {
                type: Number,

            },
            BP: {
                type: String,

            },
            heartrate: {
                type: String,

            },
            BMI: {
                type: Number,

            },
            respiratory: {
                type: Number,

            },
        },
        generalExam: {
            patientIs: [String],
            whoAppears: [String],
            has: [String],
            andIs: [String]

        },
        skin: [String],
        physicalExam: [
            {
                name: String,
                jointname: String,
                values: [String]
            }
        ],
        prescribedMedicine: {
            type: [String],

        },
        differentialDignosis: [ddschema],
        assessment: {
            type: String,

        },
        treatmentPlan: {
            type: [String],

        },
        specialTests: [specialTestSchema],
        strength: [strengthSchema],
        rangeOfMotion: {
            type: String,

        },
        medicalEquipment: {
            type: [String],

        },
        suggestedFollowup: {
            type: String,
        },
        workDutyType: {
            type: String,
        },
        workDutyIncludes: {
            type: [String]
        },
        toThe: {
            type: String
        },
        toTheInclude: {
            type: [String]
        },
        greaterThan: {
            type: String
        },
        nextVisit: {
            type: String
        },
    },




});



module.exports = mongoose.model('Problem', hpiProblemSchema);