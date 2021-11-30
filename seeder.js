const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');


//Load env vars
dotenv.config({path: './config/config.env'});

//Load Models
const Patient = require('./models/Patient');
const Problem = require('./models/Problem')

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
});

//Read JSON files
const patients = JSON.parse(fs.readFileSync(`${__dirname}/data/dummypatients.json`, 'utf-8')
);
const problems = JSON.parse(fs.readFileSync(`${__dirname}/data/dummyproblems.json`, 'utf-8')
);
//Import patient data into DB
const importPatientData = async () => {
    try {
        await Patient.create(patients);

        console.log('Data imported...'.green.inverse);

    } catch(err) {
        console.log(err);
    }
}

//Delete patient Data fromm DB
const deletePatientData = async () => {
    try {
        await Patient.deleteMany();

        console.log('Data imported...'.red.inverse);

    } catch(err) {
        console.log(err);
    }
}

//Import problem data in DB
const importProblemData = async () => {
    try {
        await Problem.create(problems);

        console.log('Data imported...'.green.inverse);

    } catch(err) {
        console.log(err);
    }
}

//Delete patient Data fromm DB
const deleteProblemData = async () => {
    try {
        await Problem.deleteMany();

        console.log('Data imported...'.red.inverse);

    } catch(err) {
        console.log(err);
    }
}

if(process.argv[2] === '-ipt') {
    importPatientData();
} else if(process.argv[2] === 'dpt') {
    deletePatientData();
} else if(process.argv[2] === 'ipb') {
    importProblemData();
} else if(process.argv[2] === 'dpb') {
    deleteProblemData();
}
