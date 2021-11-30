const mongoose = require('mongoose');

const ddschema = new mongoose.Schema({
    code: {
        type: String,

    },
    desc: {
        type: String,

    }
})

const testSchema = new mongoose.Schema({
    testName: {
        type: String,

    },
    isPass: {
        type: Boolean,
        default: false
    }
})

const specialTestSchema = new mongoose.Schema({
    bodyPart: {
        type: String,
        required: true,

    },
    tests: [testSchema]
})

const strengthSchema = new mongoose.Schema({
    strengthName: {
        type: String,

    },
    strengthValue: {
        type: Number
    }
})

const testDignosisSchema = new mongoose.Schema({
    dignosis: {
        doctorId: {
            type: String
        },
        vitals: {
            height: {
                type: Number,
                default: 5.10
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

            }
        },
        physicalExam: {
            type: [String],

        },
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

        }
    }
})

module.exports = mongoose.model('TestDignosis', testDignosisSchema);