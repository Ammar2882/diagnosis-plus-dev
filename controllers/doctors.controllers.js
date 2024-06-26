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
    checked.doesSmoke = `yes - ${sH.smoke.numberOfPacks} pack/daily`
  }
  if (sH.drink.isDrink) {
    checked.doesDrink = `yes - ${sH.drink.perSitting} per sitting/${sH.drink.howOften}`
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
    str = ` ${item.name}  ${item.dose} ${item.frequency} ${item.frequencyasneeded}`
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

const getProblems = (symptoms) => {
  var problems = ''

  if (symptoms.length > 1) {
    for (w = 0; w <= symptoms.length - 1; w++) {
      if (w >= symptoms.length - 1) {
        if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull'
          || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
          || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing'
          || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial'
          || symptoms[w] === 'Bruising') {
          problems = problems + ` and ${symptoms[w]} pain`
        }
        else {
          problems = problems + ` and ${symptoms[w]}`
        }
      }
      else {
        if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull' || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
          || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing' || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial' || symptoms[w] === 'Bruising') {
          problems = problems + `${symptoms[w]} pain, `
        }
        else {
          problems = problems + `${symptoms[w]}, `
        }
      }
    }
  }
  else {
    if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull' || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
      || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing' || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial' || symptoms[w] === 'Bruising') {
      problems = problems + `${symptoms[0]} pain`
    }
    else {
      problems = problems + `${symptoms[0]}`
    }
  }

  if (problems == "undefined") {
    return false
  }
  else {
    return problems;
  }
}



const getMedicalHistory = (medicalConditions) => {
  if (medicalConditions) {
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
  else {
    return
  }
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

  if (bodyCoordinates == "undefined") {
    return false
  }
  else {
    return bodyCoordinates;
  }
}

const getGeneralExam = (generalExam) => {
  if (generalExam.whoAppears.length <= 0 || generalExam.has.length <= 0 || generalExam.andIs <= 0 || generalExam.patientIs <= 0) {
    return false
  }
  const finalGeneralExam = {
    "whoAppears": generalExam.whoAppears[0].toLowerCase(),
    "has": generalExam.has[0].toLowerCase(),
    "andIs": generalExam.andIs[0].toLowerCase()
  }
  console.log(generalExam.patientIs[0][0])
  if (generalExam.patientIs[0][0].toUpperCase() === 'A' || generalExam.patientIs[0][0].toUpperCase() === 'E' || generalExam.patientIs[0][0].toUpperCase() === 'I'
    || generalExam.patientIs[0][0].toUpperCase() === 'O' || generalExam.patientIs[0][0].toUpperCase() === 'U') {
    finalGeneralExam.patientIs = `an ${getTreatments(generalExam.patientIs)}`
  }
  else {
    finalGeneralExam.patientIs = `a ${getTreatments(generalExam.patientIs)}`
  }
  return finalGeneralExam
}


const getProbAreasChiefCom = (areas) => {
  let str = "";

  for (q = 0; q < areas.length; q++) {
    if (areas.length >= 1) {
      str += `${areas[q]}, `
    }
    else {
      str += "(not added by the patient)"
    }
  }
  return str;
}

const getProblemConcatenated = (symptoms) => {
  var problems = ''

  if (symptoms.length > 1) {
    for (w = 0; w <= symptoms.length - 1; w++) {
      if (w >= symptoms.length - 1) {
        if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull'
          || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
          || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing'
          || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial'
          || symptoms[w] === 'Bruising') {
          problems = problems + ` and pain`
        }
        else {
          problems = problems + ` and ${symptoms[w]}`
        }
      }
      else {
        if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull' || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
          || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing' || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial' || symptoms[w] === 'Bruising') {
          problems = problems + `pain, `
        }
        else {
          problems = problems + `${symptoms[w]}, `
        }
      }
    }
  }
  else {
    if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull' || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
      || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing' || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial' || symptoms[w] === 'Bruising') {
      problems = problems + `pain`
    }
    else {
      problems = problems + `${symptoms[0]}`
    }
  }

  if (problems == "undefined") {
    return false
  }
  else {
    return problems;
  }
}


exports.generateReport = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.pID }).lean();
    const patient = await Patient.findOne({ _id: problem.patientID }).lean();

    if (!problem || !patient || !problem.isChecked) {
      return res.status(400).json({
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
    //--- let symptoms_lower = problem.symptoms.map((item) => {
    //   console.log("logging item")
    //   console.log("item : ", item)
    //   if (item) {
    //     item.toLowerCase()
    //   }
    //   else {
    //     item
    //   }

    //--- });

    let str_aggFactors = getTreatments(problem.aggravatingFactors);
    if (str_aggFactors) {
      str_aggFactors = str_aggFactors.toLowerCase();
    }
    let str_allFactors = getTreatments(problem.alleviatingFactors);
    if (str_allFactors) {
      str_allFactors = str_allFactors.toLowerCase();
    }


    let medicationsName = getCurrMed(patient.currentMedications);
    let newMedicationsName = getCurrMed(problem.currentMedications);



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

    let problem_areas = getTreatments(problem.fullBodyCoordinates)
    let problem_concatenated = getProblemConcatenated(problem.symptoms)
    let ros_general = getTreatments(patient.reviewSystem.general)
    let ros_neuro = getTreatments(patient.reviewSystem.neurologic)
    let ros_skin = getTreatments(patient.reviewSystem.skin)
    let ros_hemotologic = getTreatments(patient.reviewSystem.hemotologic)
    let ros_musculoskeletal = getTreatments(patient.reviewSystem.musculoskeletal)
    let ros_endocrine = getTreatments(patient.reviewSystem.endocrine)
    let ros_psychiatric = getTreatments(patient.reviewSystem.psychiatric)
    let general_exam = getGeneralExam(problem.dignosis.generalExam)

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
        DOB: moment(patient.dateOfBirth).format('MMMM Do, YYYY'),
        MRN: patient.insurance.membershipId,
        date: moment().format('MMMM Do, YYYY'),
        followup: problem.dignosis.suggestedFollowup,
        diagnosis: problem.dignosis.assessment,
        treatments: getTreatments(problem.dignosis.treatmentPlan),
        name: `${patient.fname} ${patient.lname}`,
        age: pAge,
        gender: patient.gender,
        problems: getProblems(problem.symptoms),
        problem_concatenated: problem_concatenated,
        pronoun,
        onset: moment(problem.symptomsStarted).format('MMMM Do, YYYY'),
        intensity: `${problem.symptomsAtBest} to ${problem.symptomsAtWorst}`,
        injury: problem.injury.details ? `"admits to ${problem.injury.Details}"` : "denies any injury",
        aggrevatingFactors: str_aggFactors,
        alleviatingFactors: str_allFactors,
        symtompsRadiate: pRadiateStr,
        isPastTreatment: problem.previousTreatment.isPreviousTreatment,
        pastTreatments: problem.previousTreatment.previousTreatmentInclude,
        pastTreatmentString: pTreatString,
        allergies: str_allergies,
        PMH: getMedicalHistory(patient.medicalConditions),
        PSH: patient.surgicalHistory,
        newMedications: newMedicationsName,//after med changes
        medications: medicationsName,
        generalExam: general_exam ? general_exam : "General Exam Not Added",
        skin: problem.dignosis.skin,
        problemAreas: problem_areas ? problem_areas : "none",
        rosGeneral: ros_general ? ros_general : "none",
        rosNeuro: ros_neuro ? ros_neuro : "none",
        rosSkin: ros_skin ? ros_skin : "none",
        rosHemotologic: ros_hemotologic ? ros_hemotologic : "none",
        rosMusculoskeletal: ros_musculoskeletal ? ros_musculoskeletal : "none",
        rosEndocrine: ros_endocrine ? ros_endocrine : "none",
        rosPsychiatric: ros_psychiatric ? ros_psychiatric : "none",
        generalBodyParts: physicalExam[0],
        handFootLandMarks: physicalExam[1],
        DD: str_DD ? str_DD : "none",
        treatmentPlan: tret,
        range: problem.dignosis.rangeOfMotion,
        strength: problem.dignosis.strength,
        ST: STA,
        negativeST: negativeSTA,
        mMC: str_MMC ? str_MMC : "none",
        fMC: str_FMC ? str_FMC : "none",
        gPMC: str_GPMC ? str_GPMC : "none",
        sMC: str_SMC ? str_SMC : "none",
        maritalStatus: patient.socialHistory.maritalStatus,
        smokes: getSocial(patient.socialHistory),
        drinks: getSocial(patient.socialHistory),
        workDType: problem.dignosis.workDutyType ? problem.dignosis.workDutyType : '', // Array
        workDIncludes: strWDIncludes ? strWDIncludes : '',
        toThe: problem.dignosis.toThe,
        toTheInclude: strToTheIncludes ? strToTheIncludes : "none", // Array,
        grtrThan: problem.dignosis.greaterThan ? problem.dignosis.greaterThan : '',
        nextVisit: problem.dignosis.nextVisit
      },
      path: `${process.env.REPORT_UPLOAD_PATH}/${problem._id}.${patient._id}.pdf`
    }
    pdf.create(document, options).then(result => res.download(`${process.env.REPORT_UPLOAD_PATH}/${problem._id}.${patient._id}.pdf`))
  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
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