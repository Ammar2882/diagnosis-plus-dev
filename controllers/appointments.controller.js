const Appointments = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');


const ErrorResponse = require('../utils/errorResponse');

exports.getAllAppts = async (req, res, next) => {
    try {
        const appts = await Appointments.find();
        if (!appts) {
            res.status(200).json({
                success: true,
                data: "no Appointments to display"
            });
        } else {
            res.status(200).json({
                success: true, data: appts
            });
        }
    } catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }
}

exports.getAppts = async (req, res) => {
    try {
        const appts = await Appointments.find({ $or: [{ 'patientID': req.user.data[1] }, { 'doctorID': req.user.data[1] }] });
        console.log(req.user.data[1])
        if (!appts) {
            res.status(200).json({
                success: true,
                data: "no Appointments to display"
            });
        } else {
            console.log(appts)
            res.status(200).json({
                success: true, data: appts
            });
        }
    } catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }

}

exports.setAppts = async(req, res) => {
    console.log("in appointment controller")
    const body = req.body;
    
    try{
        const doctor= await Doctor.findOne({ _id : req.body.doctorID})
        const patient = await Patient.findOne({_id : req.user.data[1]})

        body.patientID = req.user.data[1];
        body.doctorName = doctor.name;
        body.patientName = `${patient.fname} ${patient.lname}`
        const appt = new Appointments(body);
         try {
        const check = await Appointments.findOne({ 'doctorID': appt.doctorID, 'date': appt.date });
        if (check) {
            res.status(500).json({
                success: false,
                mesage: "Appointment already exists ! Please select another date"
            })
        } else {
            const result = await appt.save()
            res.status(200).json({
                success: true,
                message: 'Appointment added successfully'
            });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
    }
    catch(e){
       return  res.status(500).json({
            success: false,
            mesage: "this doctor does not exist"
        })
    }
}