const mongoose = require('mongoose');



const contactSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please add email'],
        match: [
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
            'Please add a valid email'
        ],
        unique: [true, "This email already exists"],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please add Phone number']
    },
    address: {
        type: String,
        required: [true, 'Please add an adress'],
    },
    unit: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    }

});

const insuranceSchema = new mongoose.Schema({
    carrier: String,
    groupId: String,
    membershipId: String,
    frontPhoto: {
        url: String,
        public_id: String
    },
    backPhoto: {
        url: String,
        public_id: String
    },

});

const surgicalHistorySchema = new mongoose.Schema({
    name: {
        type: String
    },
    code: {
        type: String
    }
})

const emergencyContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add emergency contact name']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add emergency contact phone number']
        // maxlength: [14, 'Please enter a valid phone number'],
        // minlength: [10, 'Please enter a valid phone number']
    }
});

const familyHistorySchema = new mongoose.Schema({
    motherMConditions: {
        type: [String],
        required: [true, 'Please add mother medical conditions']
    },
    fatherMConditions: {
        type: [String],
        required: [true, 'Please add father medical conditions']
    },
    grandparentMConditions: {
        type: [String],
        required: [true, 'Please add grand parent medical conditions']
    },
    siblingsMConditions: {
        type: [String],
        required: [true, 'Please add sublings medical conditions']
    }

});

const smokeSchema = new mongoose.Schema({
    isSmoke: {
        type: Boolean,
        required: [true, 'Please enter if you smoke or not'],
        default: false
    },
    numberOfPacks: {
        type: String,
        required: false
    }
});

const drinkAlcholSchema = new mongoose.Schema({
    isDrink: {
        type: Boolean,
        required: true,
        default: false
    },
    howOften: {
        type: String,
        required: false,
        default: 'Never'
    },
    perSitting: {
        type: String,
        required: false,
        default: 'None'
    }
})

const socialHistorySchema = new mongoose.Schema({
    smoke: smokeSchema,
    drink: drinkAlcholSchema,
    maritalStatus: {
        type: String,
        required: [true, 'Please add your marital status']
    },
    handDominance: {
        type: String,
        required: [true, 'Please Enter Your Dominant Hand']
    },
    occupation: {
        type: String,
        required: [true, 'Please Enter Your Occupation']
    }
});

const reviewOfSystemsSchema = new mongoose.Schema({
    general: {
        type: [String],
        required: true,
        default: 'None'
    },
    neurologic: {
        type: [String],
        required: true,
        default: 'None'
    },
    skin: {
        type: [String],
        required: true,
        default: 'None'
    },
    hemotologic: {
        type: [String],
        required: true,
        default: 'None'
    },
    musculoskeletal: {
        type: [String],
        required: true,
        default: 'None'
    },
    endocrine: {
        type: [String],
        required: true,
        default: 'None'
    },
    psychiatric: {
        type: [String],
        required: true,
        default: 'None'
    }
})

const user = new mongoose.Schema({
    fname: {
        type: String,
        required: [true, 'Please add first name'],
    },
    mname: {
        type: String,
        required: false
    },
    lname: {
        type: String,
        required: [true, 'Please add last name'],
    },
    suffix: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: [true, "Please select a gender"]
    },
    password: {
        type: String,
        required: true

    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please add date of birth'],
        min: '1900-01-01',
        max: Date.now()
    },
    contact: contactSchema,
    pharmacy: {
        type: [String],
        required: [true, 'Please add pharmacy']
    },
    insurance: insuranceSchema,
    emergencyContact: emergencyContactSchema,
    medicalConditions: [{
        condition: String,
        value: String
    }],
    surgicalHistory: [surgicalHistorySchema],
    familyHistory: familyHistorySchema,
    socialHistory: socialHistorySchema,
    currentMedications: {
        type: [{
            name: String,
            dose: String,
            frequency: String,
            frequencyasneeded: String
        }],
        required: true,
    },
    allergies: [
        {
            name: String,
            reaction: String
        }
    ],
    reviewSystem: reviewOfSystemsSchema,
    labs: [
        {
            doctorId: String,
            patientId: String,
            name: String,
            description: String,
            date: String,
            photos: [{
                url: String,
                public_id: String
            }],
            pdf: [{
                url: String,
                public_id: String
            }],

        }
    ]

});

module.exports = mongoose.model('Patient', user);
