const mongoose = require('mongoose');
var date = new Date();

const appointmentSchema = new mongoose.Schema({
    patientID: {
        type: String,
        required: [true, 'Please add the id of the patient who want to book an appointment']
    },
    doctorID: {
        type: String,
        required: [true, 'Please add doctor id']
    },
    date: {
        type: Date,
        required: [true, 'Please enter the appointment date']
    },
    doctorName:{
        type:String,
        required:[true , "doctor name missing"]
    },
    patientName:{
        type:String,
        required:[true , "patient name missing"]
    }
});

module.exports = mongoose.model('Appointment', appointmentSchema);