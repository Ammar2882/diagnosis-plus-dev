const Doctor = require('../models/Doctor')
const ICD = require('../models/ICDcodes')
const Problem = require('../models/Problem')
const Patient = require('../models/Patient')
const SpecialTests = require('../models/SpecialTests')
const ErrorResponse = require('../utils/errorResponse')
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const pdf = require('pdf-creator-node')
const moment = require('moment')
var count = 0;

/** 
// ! @dec Get doctor by id in params
// ! @route GET /api/v1/doctors/:id
// ! @access Public (no need to get autheticated)
*/
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.find({ '_id': req.params.id });

    if (!doctor) { next(new ErrorResponse('Doctor not found', 404)) }
    res.status(200).json({
      success: true, data: doctor
    });

  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }

}


/**
* !@dec Get a single doctor from jwt token
* !@route GET /api/v1/doctors
* !@access Public (no need to get autheticated) 
*/
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user.data[1]);

    // we are returning because if record isnt present by id it will show two errors. by returning, it will only return the first one.
    //the catch statement will be executed if the format of the id is incorrect
    //if statement is executed when the format is correct but id is not present into the database
    if (!doctor) {
      return next(new ErrorResponse(`Doctor not found with id of ${req.user.data[1]}`, 404));
    }

    res.status(200).json({
      success: true, data: doctor
    })

  } catch (err) {
    next(new ErrorResponse(err.message, 500));

  }
}

exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();

    if (!doctors) { next(new ErrorResponse('Doctors not found', 404)) }
    res.status(200).json({
      success: true, count: doctors.length, data: doctors
    });

  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}


/**
* !@dec Update  doctor
* !@route PUT /api/v1/doctors/
* !@access Private
 */
exports.updateDoctor = async (req, res, next) => {
  if (req.body.password) {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);

    req.body.password = hash;
  }

  try {
    const doctor = await Doctor.findByIdAndUpdate(req.user.data[1], req.body, {
      new: true,
      runValidators: true, // this is mongoose validators
    });

    if (!doctor) {
      res.status(400).json({
        success: false,
        message: "Doctor not found!"
      })
    }


    res.status(200).json({
      success: true,
      message: "Doctor updated successfully!"
    })

  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}

/**
* !@dec Delete  doctor
* !@route DELETE /api/v1/doctors/:id
* !@access Private 
*/
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.user.data[1]);

    if (!doctor) {
      res.status(400).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, message: "Doctor deleted successfully" })

  } catch (err) {
    res.status(400).json({ success: false, message: err })

  }
  res
    .status(200)
    .json({ success: "true", msg: `Delete Doctor ${req.user.data[1]}` })
}

exports.loginDoctor = async (req, res, next) => {
  try {
    const email = req.body.email;

    // lets check if email exists
    const result = await Doctor.findOne({ "email": email });
    if (!result) {
      // this means result is null
      next(new ErrorResponse('Credentials incorrect, Please try again.', 401))
    } else {

      if (bcrypt.compareSync(req.body.password, result.password)) {
        // great, allow this user access
        result.password = undefined;

        const token = jsonwebtoken.sign({
          data: [result.email, result._id],
          role: 'Doctor'
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ success: true, token: token });
      }
      else {
        next(new ErrorResponse("Credentials incorrect, Please try again.", 401))
      }
    }
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
};


exports.registerDoctor = async (req, res, next) => {
  try {
    const check = await Doctor.findOne({ 'email': req.body.email })
    if (check) {
      next(new ErrorResponse("Email has already signed up", 401))
    } else {
      // there must be a password in body
      // we follow these 2 steps
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(req.body.password, salt);

      req.body.password = hash;
      const doctor = new Doctor(req.body);

      await doctor.save();

      res.send({
        success: true,
        message: 'Doctor Signup successful'
      });
    }
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
};


exports.searchCode = async (req, res, next) => {
  try {
    const searched = req.query.tbv;
    const data = await ICD.find({ 'Description': { $regex: searched, $options: '$i' } });
    res.send(data)
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
}

exports.diagnosis = async (req, res, next) => {
  console.log('I am Diagnosis')
  try {
    const prb = await Problem.findOneAndUpdate(
      { '_id': req.params.pID },
      req.body,
      {
        new: true,
        runValidators: true,
      });

    if (!prb) {
      return next(new ErrorResponse('problem does not exist', 400))
    }

    await Problem.findOneAndUpdate(
      { '_id': req.params.pID },
      { 'isChecked': true }
    )

    res.status(200).json({
      success: true,
      data: prb
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

//helper functions for generation of report
const getAge = (dob) => {
  let month_diff = Date.now() - dob.getTime();
  let age_dt = new Date(month_diff);

  let year = age_dt.getUTCFullYear();

  let age = Math.abs(year - 1970);

  return age
}
const getPassST = (st) => {
  let newArr = [];
  st.forEach(specialTest => {
    specialTest.test.forEach(s => {
      if (s.isLeftPass) {
        newArr.push(`${s.testName} on the left`)
      }
      if (s.isRightPass) {
        newArr.push(`${s.testName} on the right`)
      }
    });
  })
  return newArr;
}
const getFailST = (st) => {
  let newArr = [];
  st.forEach(specialTest => {
    specialTest.test.forEach(s => {
      if (!s.isLeftPass) {
        newArr.push(`${s.testName} on the left`)
      }
      if (!s.isRightPass) {
        newArr.push(`${s.testName} on the right`)
      }
    });
  });
  return newArr;
}
const getSocial = (sH) => {
  let checked = {
    doesSmoke: "No",
    doesDrink: "No"
  }

  if (sH.smoke.isSmoke) {
    checked.doesSmoke = `yes- ${sH.smoke.numberOfPacks} pack /daily`
  }
  if (sH.drink.isDrink) {
    checked.doesDrink = `yes- ${sH.drink.perSitting} per sitting /${sH.drink.howOften}`
  }
  return checked
}


const getRadiateStr = (condition, pr) => {
  console.log("condition : " + condition)
  if (condition) {
    return `${pr} admits to the radiation of symptoms`
  } else {
    return `${pr} denies any radiating symptoms`
  }
}
const getPreviousTreatments = (sPT, p) => {
  let str = ""
  if (sPT.isPreviousTreatment || (sPT.previousTreatmentInclude != "None")) {
    str = `${p.fname} has received treatment for this issue in the past including ${sPT.previousTreatmentInclude.map(t => `${t} `)} `
    return str
  } else {
    str = `${p.fname} has not received treatment for this issue in the past.`
    return str
  }

}

const getDDStr = (dd) => {
  let arr = [];
  dd.forEach(item => {
    arr.push(item.desc);
  });
  return arr;
}

const getCurrMed = (med) => {
  let meds = [];
  let str = "";
  med.forEach(item => {
    str = ` ${item.name}  ${item.dose} ${item.frequency}`
    meds.push(str);
  });

  return meds;
}
const getPhysicalExam = (physicalExam) => {
  var handFootArray = []
  var otherBodyPartArray = []
  var finalHandFootArray = []
  var finalOtherBodyPartArray = []
  for (s = 0; s < physicalExam.length; s++) {
    if ((physicalExam[s].name === "left hand" || physicalExam[s].name === "right hand" || physicalExam[s].name === "left foot" || physicalExam[s].name === "right foot")) {

      handFootArray.push(physicalExam[s])
    }
    else {
      otherBodyPartArray.push(physicalExam[s])
    }
  }
  finalHandFootArray = handFootArray.map((item) => {
    return `${item.jointname} joint of ${item.name} at ${getFinger(item.values)}`
  })
  finalOtherBodyPartArray = otherBodyPartArray.map((item) => {
    return `${item.jointname} joint of ${item.name}`
  })
  return [finalOtherBodyPartArray, finalHandFootArray]

}

const getFinger = (fingersArray) => {
  var fingers = ''

  if (fingersArray.length > 1) {
    for (k = fingersArray.length - 1; k >= 0; k--) {
      if (k <= 0) {
        fingers = fingers + ` and ${fingersArray[k]}`
      }
      else {
        fingers = fingers + `${fingersArray[k]}, `
      }
    }
  }
  else {
    fingers = fingers + `${fingersArray[0]}`
  }
  return fingers;
}

// const getProblemAreas = (fullBodyCoordinates) => {
//   var bodyCoordinates = ''

//   if (fullBodyCoordinates.length > 1) {
//     for (p = fullBodyCoordinates.length - 1; p >= 0; p--) {
//       if (p <= 0) {
//         bodyCoordinates = bodyCoordinates + ` and ${fullBodyCoordinates[p]}`
//       }
//       else {
//         bodyCoordinates = bodyCoordinates + `${fullBodyCoordinates[p]}, `
//       }
//     }
//   }
//   else {
//     bodyCoordinates = bodyCoordinates + `${fullBodyCoordinates[0]}`
//   }
//   console.log(bodyCoordinates)
//   return bodyCoordinates;
// }



const getMedicalHistory = (medicalConditions) => {
  finalMedicalConditions = []
  for (e = 0; e < medicalConditions.length; e++) {
    if (medicalConditions[e].condition.toLowerCase() === 'cancer') {
      finalMedicalConditions.push(`Cancer with type (${medicalConditions[e].value})`)
    }
    else if (medicalConditions[e].condition.toLowerCase() === 'diabetes') {
      finalMedicalConditions.push(`Diabetes with AIC (${medicalConditions[e].value})`)
    }
    else {
      finalMedicalConditions.push(`${medicalConditions[e].condition}`)
    }
  }
  return finalMedicalConditions
}
const getGeneralExam = (generalExam) => {
  const finalGeneralExam = {
    "whoAppears": generalExam.whoAppears[0],
    "has": generalExam.has[0],
    "andIs": generalExam.andIs[0]
  }
  console.log(generalExam.patientIs[0][0])
  if (generalExam.patientIs[0][0].toUpperCase() === 'a'.toUpperCase() || generalExam.patientIs[0][0].toUpperCase() === 'e'.toUpperCase() || generalExam.patientIs[0][0].toUpperCase() === 'i'.toUpperCase()
    || generalExam.patientIs[0][0].toUpperCase() === 'o'.toUpperCase() || generalExam.patientIs[0][0].toUpperCase() === 'u'.toUpperCase()) {
    finalGeneralExam.patientIs = `an ${getTreatments(generalExam.patientIs)}`
  }
  else {
    finalGeneralExam.patientIs = `a ${getTreatments(generalExam.patientIs)}`
  }
  return finalGeneralExam
}

const getTreatments = (fullBodyCoordinates) => {
  var bodyCoordinates = ''

  if (fullBodyCoordinates.length > 1) {
    for (p = 0; p <= fullBodyCoordinates.length - 1; p++) {
      if (p >= fullBodyCoordinates.length - 1) {
        bodyCoordinates = bodyCoordinates + ` and ${fullBodyCoordinates[p]}`
      }
      else {
        bodyCoordinates = bodyCoordinates + `${fullBodyCoordinates[p]}, `
      }
    }
  }
  else {
    bodyCoordinates = bodyCoordinates + `${fullBodyCoordinates[0]}`
  }
  console.log(bodyCoordinates + " : " + bodyCoordinates.length)
  if (bodyCoordinates == "undefined") {
    return 'Not added by the patient'
  }
  else {
    return bodyCoordinates;
  }

}


exports.generateReport = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.pID }).lean();
    const patient = await Patient.findOne({ _id: problem.patientID }).lean();

    if (!problem || !patient) {
      res.status(400).json({
        success: false,
        data: "Something has gone wrong"
      })
    }

    //HELPER METHOD CALLS
    const pAge = getAge(patient.dateOfBirth);
    const pSocial = getSocial(patient.socialHistory)
    // const smokeDrink = getSocial(patient.socialHistory)
    const STA = getPassST(problem.dignosis.specialTests);
    const negativeSTA = getFailST(problem.dignosis.specialTests);
    const pTreatString = getPreviousTreatments(problem.previousTreatment, patient);
    let pronoun;
    if (patient.gender === 'male') { pronoun = 'He' }
    else if (patient.gender === 'female') { pronoun = 'She' }
    else { pronoun = 'They' }
    const pRadiateStr = getRadiateStr(problem.symptomsRadiation.isRadiate, pronoun);
    const tret = [...problem.dignosis.treatmentPlan, ...problem.dignosis.medicalEquipment];

    const template = fs.readFileSync('./template/template.html', 'utf-8');
    let symptoms_lower = problem.symptoms.map(item => item.toLowerCase());

    let str_aggFactors = getTreatments(problem.aggravatingFactors);
    str_aggFactors = str_aggFactors.toLowerCase();

    let str_allFactors = getTreatments(problem.alleviatingFactors);
    str_allFactors = str_allFactors.toLowerCase();

    let medicationsName = getCurrMed(patient.currentMedications);


    let physicalExam = getPhysicalExam(problem.dignosis.physicalExam)

    // str_medications = str_medications.toLowerCase();

    let str_allergies = patient.allergies;

    // --- let str_PMH = patient.medicalConditions.join();

    let str_MMC = getTreatments(patient.familyHistory.motherMConditions);

    let str_FMC = getTreatments(patient.familyHistory.fatherMConditions);

    let str_GPMC = getTreatments(patient.familyHistory.grandparentMConditions);

    let str_SMC = getTreatments(patient.familyHistory.siblingsMConditions);

    let arr_DD = getDDStr(problem.dignosis.differentialDignosis);
    let str_DD = getTreatments(arr_DD);

    let strWDIncludes = getTreatments(problem.dignosis.workDutyIncludes);
    let strToTheIncludes = getTreatments(problem.dignosis.toTheInclude);

    const options = {
      format: 'A4',
      orientation: 'potrait',
      border: '20mm'
    }

    const document = {

      html: template,
      data: {
        lN: patient.lname,
        fN: patient.fname,
        DOB: moment(patient.dateOfBirth).format('MMMM Do YYYY'),
        MRN: patient.insurance.membershipId,
        date: moment().format('MMMM Do YYYY'),
        followup: problem.dignosis.suggestedFollowup,
        diagnosis: problem.dignosis.assessment,
        treatments: getTreatments(problem.dignosis.treatmentPlan),
        name: `${patient.fname} ${patient.lname}`,
        age: pAge,
        gender: patient.gender,
        problems: getTreatments(problem.symptoms),
        pronoun,
        onset: moment(problem.symptomsStarted).format('MMMM Do YYYY'),
        intensity: `${problem.symptomsAtBest} to ${problem.symptomsAtWorst}`,
        injury: `"${problem.injury.Details}"`,
        aggrevatingFactors: str_aggFactors,
        alleviatingFactors: str_allFactors,
        symtompsRadiate: pRadiateStr,
        // isPastTreatment: problem.previousTreatment.isPreviousTreatment,
        // pastTreatments: problem.previousTreatment.previousTreatmentInclude,
        pastTreatmentString: pTreatString,
        allergies: str_allergies,
        PMH: getMedicalHistory(patient.medicalConditions),
        PSH: patient.surgicalHistory,
        newMedications: problem.currentMedications,//after med changes
        medications: medicationsName.join(),
        problemAreas: getTreatments(problem.fullBodyCoordinates),
        generalExam: getGeneralExam(problem.dignosis.generalExam),
        skin: problem.dignosis.skin,
        rosGeneral: getTreatments(patient.reviewSystem.general),
        rosNeuro: getTreatments(patient.reviewSystem.neurologic),
        rosSkin: getTreatments(patient.reviewSystem.skin),
        rosHemotologic: getTreatments(patient.reviewSystem.hemotologic),
        rosMusculoskeletal: getTreatments(patient.reviewSystem.musculoskeletal),
        rosEndocrine: getTreatments(patient.reviewSystem.endocrine),
        rosPsychiatric: getTreatments(patient.reviewSystem.psychiatric),
        generalBodyParts: physicalExam[0],
        handFootLandMarks: physicalExam[1],
        DD: str_DD,
        treatmentPlan: tret,
        range: problem.dignosis.rangeOfMotion,
        strength: problem.dignosis.strength,
        ST: STA,
        negativeST: negativeSTA,
        mMC: str_MMC,
        fMC: str_FMC,
        gPMC: str_GPMC,
        sMC: str_SMC,
        maritalStatus: patient.socialHistory.maritalStatus,
        smokes: getSocial(patient.socialHistory),
        drinks: getSocial(patient.socialHistory),
        workDType: problem.dignosis.workDutyType, // Array
        workDIncludes: strWDIncludes,
        toThe: problem.dignosis.toThe,
        toTheInclude: strToTheIncludes, // Array,
        grtrThan: problem.dignosis.greaterThan,
        nextVisit: problem.dignosis.nextVisit
      },
      path: `${process.env.REPORT_UPLOAD_PATH}/${problem._id}.${patient._id}.pdf`
    }
    pdf.create(document, options).then(result => res.download(`${process.env.REPORT_UPLOAD_PATH}/${problem._id}.${patient._id}.pdf`))
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}

exports.getWaitingList = async (req, res, next) => {
  try {
    const waiting = await Problem.find({ 'isChecked': false, "doctorId": req.user.data[1] });
    if (!waiting) {
      res.status(200).json({
        data: "No patients in waiting",

      })
    }
    res.status(200).json({
      count: waiting.length,
      success: true,
      data: waiting
    })
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}

exports.getPreviousAppointments = async (req, res, next) => {
  try {
    const prev = await Problem.find({ 'isChecked': true, "doctorId": req.user.data[1] });
    if (!prev) {
      res.status(200).json({
        data: "No patients in previously checked",
      })
    }
    res.status(200).json({
      count: prev.length,
      success: true,
      data: prev
    })
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}