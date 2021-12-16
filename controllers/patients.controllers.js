// In this file we're gonne hva a file for each resource
const Patient = require('../models/Patient');
const Pharma = require('../models/Pharmacies');
const OtherMedConditions = require('../models/OtherMedicalConditions');
const Test = require('../models/Test');
const Problem = require('../models/Problem');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const cloudinary = require("cloudinary");
const fs = require('fs');
const mongoose = require('mongoose');
const { destroyImage, uploadImage, uploadPdf } = require('../helpers/helpers')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


// @dec Get all patient
// @route GET /api/v1/patients
// @access Public (no need to get autheticated)
exports.getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find();

    res.status(200).json({
      success: true, count: patients.length, data: patients
    });

  } catch (err) {

  }

}

// @dec Get a single patient
// @route GET /api/v1/patients/:id
// @access Public (no need to get autheticated)
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.user.data[1]);

    // we are returning because if record isnt present by id it will show two errors. by returning, it will only return the first one.
    //the catch statement will be executed if the format of the id is incorrect
    //if statement will be executed when the format is correct but id is not present into the database
    if (!patient) {
      return next(new ErrorResponse(`Patient not found with id of ${req.user.data[1]}`, 404));
    }

    res.status(200).json({
      success: true, data: patient
    })

  } catch (err) {
    next(new ErrorResponse(`Patient not found.`, 404));

  }
}

// @dec Update  patient
// @route PUT /api/v1/bootcamps/:id
// @access Private 
exports.updatePatientInsurance = async (req, res, next) => {
  console.log("in update patient")
  console.log(req.body)
  console.log(req.files)
  try {
    const p = await Patient.findOne({ '_id': req.user.data[1] })
    if (!p) {
      return res.status(404).json({
        "message": "Patient not found"
      })
    }
    else {
      var toBeAdded = {
        groupId: req.body.groupId,
        membershipId: req.body.membershipId,
        carrier: req.body.carrier,
        frontPhoto: {
          url: p.insurance.frontPhoto.url,
          public_id: p.insurance.frontPhoto.public_id
        },
        backPhoto: {
          url: p.insurance.backPhoto.url,
          public_id: p.insurance.backPhoto.public_id
        }
      }

      if (req.body.insurance) {
        if (req.files.frontPhoto) {
          if (p.insurance.frontPhoto.url) {
            console.log('i entered in front delete photo')
            destroyImage(`${p.insurance.frontPhoto.public_id}`)
            const urlId = await uploadImage(req.files.frontPhoto, next)
            toBeAdded.frontPhoto.url = urlId.url
            toBeAdded.frontPhoto.public_id = urlId.public_id

          }
          else {
            console.log('i never in front delete photo')
            const urlId = await uploadImage(req.files.frontPhoto, next)
            toBeAdded.frontPhoto.url = urlId.url
            toBeAdded.frontPhoto.public_id = urlId.public_id
          }

        }


        if (req.files.backPhoto) {
          if (p.insurance.backPhoto.url) {
            destroyImage(`${p.insurance.backPhoto.public_id}`)
            const urlId = await uploadImage(req.files.backPhoto, next)
            toBeAdded.backPhoto.url = urlId.url
            toBeAdded.backPhoto.public_id = urlId.public_id

          }
          else {
            const urlId = await uploadImage(req.files.backPhoto, next)
            console.log(urlId)
            toBeAdded.backPhoto.url = urlId.url
            toBeAdded.backPhoto.public_id = urlId.public_id
          }

        }


      }
      const updatedPatient = await Patient.findOneAndUpdate({ _id: req.user.data[1] }, { insurance: toBeAdded })
      if (!updatedPatient) {
        return res.status(400).json({
          success: false,
          data: null
        })
      }
      else {
        return res.status(200).json({
          success: true,
          data: updatedPatient
        })
      }
    }

  }
  catch (err) {
    next(new ErrorResponse(err.message, 500))
  }

}



exports.updatePatientLabs = async (req, res, next) => {
  console.log("in update labs")
  console.log(req.body)
  console.log(req.files)
  try {
    const p = await Patient.findOne({ _id: req.body.patientId })
    if (!p) {
      return res.status(404).json({
        "message": "Patient not found"
      })
    }
    else {
      var toBeAdded = {
        patientId: req.body.patientId,
        doctorId: req.body.doctorId,
        name: req.body.name,
        date: req.body.date,
        description: req.body.description,
        photos: [],
        pdf: []
      }
      if (req.files) {
        if (req.files.photos) {
          if (Array.isArray(req.files.photos)) {
            for (i = 0; i < req.files.photos.length; i++) {
              console.log("checking for photos")
              const urlId = await uploadImage(req.files.photos[i], next)
              console.log(urlId)
              var setPhotos = {
                "url": urlId.url,
                "public_id": urlId.public_id
              }
              toBeAdded.photos[i] = setPhotos
            }
          }
          else {
            const urlId = await uploadImage(req.files.photos, next)
            var setPhotos = {
              "url": urlId.url,
              "public_id": urlId.public_id
            }
            toBeAdded.photos = setPhotos
          }
        }
        if (req.files.pdf) {
          if (Array.isArray(req.files.pdf)) {
            for (i = 0; i < req.files.pdf.length; i++) {
              console.log("checking for pdfs")
              const urlId = await uploadPdf(req.files.pdf[i], next)
              console.log(urlId)
              var setPdf = {
                "url": urlId.url,
                "public_id": urlId.public_id
              }
              toBeAdded.pdf[i] = setPdf
            }
          }
          else {
            const urlId = await uploadPdf(req.files.pdf, next)
            var setPdf = {
              "url": urlId.url,
              "public_id": urlId.public_id
            }
            toBeAdded.pdf = setPdf
          }
        }
        // if (req.files.pdf) {
        //   const urlId = await uploadPdf(req.files.pdf, next)
        //   toBeAdded.pdf.url = urlId.url
        //   toBeAdded.pdf.public_id = urlId.public_id
        // }
      }
      const updatedPatient = await Patient.findOneAndUpdate({ _id: req.body.patientId }, { $push: { labs: toBeAdded } }, { new: true, })
      if (!updatedPatient) {
        return res.status(400).json({
          success: false,
          data: null
        })
      }
      else {
        return res.status(200).json({
          success: true,
          data: updatedPatient
        })
      }
    }

  }

  catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}


exports.getPatientLabs = async (req, res) => {
  console.log("getting patient labs")
  try {
    const p = await Patient.findOne({ _id: req.body.patientId })
    console.log("**************", p.labs)
    if (p.labs.length <= 0) {
      return res.status(200).json({
        success: true,
        data: "No Labs Found"
      })
    }
    else {
      return res.status(200).json({
        success: true,
        data: p.labs
      })
    }

  }
  catch (e) {
    return res.status(400).json({
      success: false,
      error: e
    })
  }
}

exports.updatePatient = async (req, res) => {
  console.log("I am In Update Patient Route")
  console.log(req.body)
  try {
    const p = await Patient.findOne({ '_id': req.user.data[1] })
    if (!p) {
      return res.status(404).json({
        "message": "Patient not found"
      })
    }
    else {
      const updatedPatient = await Patient.findOneAndUpdate({ _id: req.user.data[1] }, req.body)
      return res.status(200).json({
        "message": "record updated successfully",
        'data': updatedPatient
      })
    }
  }
  catch (e) {
    res.status(400).json({ status: failed, message: e })
  }
}

// @dec Delete  patient
// @route DELETE /api/v1/patients/:id
// @access Private 
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.user.data[1]);

    if (!patient) {
      res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true })

  } catch (err) {
    res.status(400).json({ success: false })

  }
  res
    .status(200)
    .json({ success: "true", msg: `Delete patient ${req.user.data[1]}` })
}

exports.registerUser = async (req, res, next) => {
  console.log("i am in register patient")
  try {
    const body = req.body;
    console.log(body)
    console.log(req.files)

    const password = body.password;

    // there must be a password in body
    // we follow these 2 steps
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    let surgHistArr = [];
    if (Array.isArray(JSON.parse(req.body.surgicalHistName))) {
      for (let i = 0; i < JSON.parse(req.body.surgicalHistName).length; i++) {
        let surgObj = {
          "name": JSON.parse(req.body.surgicalHistName)[i],
          "code": JSON.parse(req.body.surgicalHistCode)[i]
        }
        surgHistArr.push(surgObj);
      }
    } //end of if statement 
    else {
      let surgObj = {
        "name": JSON.parse(req.body.surgicalHistName)[0],
        "code": JSON.parse(req.body.surgicalHistCode)[0]
      }
      surgHistArr.push(surgObj);
    }

    const patient = new Patient({
      fname: req.body.fname,
      mname: req.body.mname,
      lname: req.body.lname,
      suffix: req.body.suffix,
      gender: req.body.gender,
      password: hash,
      dateOfBirth: body.dateOfBirth,
      "contact.email": body.email,
      "contact.phone": body.phone,
      "contact.address": body.address,
      "contact.unit": body.unit,
      "contact.city": body.city,
      "contact.state": body.state,
      "contact.zipCode": body.zipCode,
      pharmacy: JSON.parse(body.pharmacy),
      "insurance.carrier": body.carrier,
      "insurance.groupId": body.groupId,
      "insurance.membershipId": body.membershipId,
      "insurance.frontPhoto": {
        url: '',
        public_id: ''
      },
      "insurance.backPhoto": {
        url: '',
        public_id: ''
      },
      "emergencyContact.name": body.name,
      "emergencyContact.phoneNumber": body.phoneNumber,
      medicalConditions: JSON.parse(body.medicalConditions),
      surgicalHistory: surgHistArr,
      "familyHistory.motherMConditions": JSON.parse(body.motherMConditions),
      "familyHistory.fatherMConditions": JSON.parse(body.fatherMConditions),
      "familyHistory.grandparentMConditions": JSON.parse(body.grandparentMConditions),
      "familyHistory.siblingsMConditions": JSON.parse(body.siblingsMConditions),
      "socialHistory.smoke.isSmoke": body.isSmoke,
      "socialHistory.smoke.numberOfPacks": body.numberOfPacks,
      "socialHistory.drink.isDrink": body.isDrink,
      "socialHistory.drink.howOften": body.howOften,
      "socialHistory.drink.perSitting": body.perSitting,
      "socialHistory.maritalStatus": body.maritalStatus,
      "socialHistory.handDominance": body.maritalStatus,
      "socialHistory.occupation": body.maritalStatus,
      currentMedications: JSON.parse(body.currentMedications),
      allergies: JSON.parse(body.allergies),
      "reviewSystem.general": JSON.parse(body.general),
      "reviewSystem.neurologic": JSON.parse(body.neurologic),
      "reviewSystem.skin": JSON.parse(body.skin),
      "reviewSystem.hemotologic": JSON.parse(body.hemotologic),
      "reviewSystem.musculoskeletal": JSON.parse(body.musculoskeletal),
      "reviewSystem.endocrine": JSON.parse(body.endocrine),
      "reviewSystem.psychiatric": JSON.parse(body.psychiatric)

    });

    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 404));
    }

    if (req.files.frontPhoto) {
      console.log('i am in frontPhoto upload for signup')
      const urlId = await uploadImage(req.files.frontPhoto, next)
      patient.insurance.frontPhoto.url = urlId.url
      patient.insurance.frontPhoto.public_id = urlId.public_id
    }
    if (req.files.backPhoto) {
      console.log('i am in backPhoto upload for signup')
      const urlId = await uploadImage(req.files.backPhoto, next)
      patient.insurance.backPhoto.url = urlId.url
      patient.insurance.backPhoto.public_id = urlId.public_id
    }


    // ImageDataUploadFunction(req, patient);
    // --- let currMedArr = [];
    // const medNameArr = JSON.parse(body.currentMedicationsName);
    // const medDoseArr = JSON.parse(body.currentMedicationsDose);
    // const medFreqArr = JSON.parse(body.currentMedicationsFrequency);

    // for (let i = 0; i < medNameArr.length; i++) {
    //   const medObj = {
    //     name: medNameArr[i],
    //     dose: medDoseArr[i],
    //     frequency: medFreqArr[i]
    //   }

    //   currMedArr.push(medObj);
    // }

    // patient.currentMedications = currMedArr; ---

    setTimeout(async () => {
      console.log("after setting fields " + patient)
      const result = await patient.save();
    }, 2000);



    res.status(200).json({
      success: true,
      message: 'Signup successful'
    });
  } catch (ex) {
    console.log('ex', ex);
    if (ex.code === 11000) {
      res.json({
        success: false,
        message: 'This email has been registered already',
      })
        .status(500);
    }
    else {
      res.json({
        message: `Error: ${ex}`,
        detail: ex
      })
        .status(500);
    }
  }
}


exports.loginUser = async (req, res, next) => {
  try {
    const email = req.body.email;

    // lets check if email exists

    const result = await Patient.findOne({ 'contact.email': email });
    if (!result) {
      // this means result is null
      res.status(401).send({
        Error: 'This user doesnot exists. Please signup first'
      });
    } else {
      // email did exist
      // so lets match password

      if (bcrypt.compareSync(req.body.password, result.password)) {
        // great, allow this user access

        result.password = undefined;

        const token = jsonwebtoken.sign({
          data: [result.contact.email, result._id],
          role: 'Patient'
        }, process.env.JWT_SECRET);

        res.status(200).json({
          success: true,
          message: 'Successfully Logged in',
          token: token
        });
      }

      else {
        console.log('password doesnot match');

        res.status(401).json({
          success: false,
          message: 'Wrong email or Password'
        });
      }
    }
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
};

// @dec Delete  upload photo
// @route PUT /api/v1/patients/:id/photo
// @access Private 
/*exports.patientPhotoUpload = async (req, res, next) => {
  //  try {
  const patient = await Patient.findById(req.params.id);
 
  if (!patient) {
    res.status(400).json({ success: false });
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404));
  }
 
  const file = req.files.front;
 
  //make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
 
  //check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    res.status(400).json({ success: false, message: "Please upload a an image file less than 1MBs" })
    //return next(new ErrorResponse(`Please upload a an image file less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }
 
  //Getting date
  const d = new Date();
  //Create a custom file name
  file.name = `photo_${patient._id}-${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}_${d.getHours()}_${d.getUTCMinutes()}_${d.getUTCSeconds()}${path.parse(file.name).ext}`; // path.parse().ext gives the file extension
 
  console.log(file.name);
 
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 400)); // next func error response
    }
 
    // await Patient.findByIdAndUpdate(req.params.id, {photo: file.name});
    res.status(200).json({
      succes: true,
      data: file.name
    });
 
 
  }); // end of file.mv statement
 
  res.status(200).json({ success: true })
 
 
 
  // } catch (err) {
  // res.status(400).json({ success: false, msg: err })
  // return next(new ErrorResponse(`Error`, 400));
 
 
  //}
}*/

exports.testUser = async (req, res, next) => {
  try {

    const body = req.body;
    const test = new Test();



    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 404));
    }


    const insurFrontPhoto = req.files.frontPhoto;
    const insurBackPhoto = req.files.backPhoto;


    //make sure the image is a photo
    if (!insurFrontPhoto.mimetype.startsWith('image') && !insurBackPhoto.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    //Getting date
    //const d = new Date();
    //Create a custom file name
    //insurFrontPhoto.name = `front_${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}_${d.getHours()}_${d.getUTCMinutes()}_${d.getUTCSeconds()}${path.parse(insurFrontPhoto.name).ext}`; // path.parse().ext gives the file extension
    //insurBackPhoto.name = `back_${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}_${d.getHours()}_${d.getUTCMinutes()}_${d.getUTCSeconds()}${path.parse(insurBackPhoto.name).ext}`; // path.parse().ext gives the file extension
    //surgHistFile.name = `surg_${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}_${d.getHours()}_${d.getUTCMinutes()}_${d.getUTCSeconds()}${path.parse(surgHistFile.name).ext}`; // path.parse().ext gives the file extension




    const uploadFront = await insurFrontPhoto.mv(`${process.env.FILE_UPLOAD_PATH}/insurance/${insurFrontPhoto.name}`, err => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 400)); // next func error response
      }
    });
    cloudinary.uploader.upload(`${process.env.FILE_UPLOAD_PATH}/insurance/${insurFrontPhoto.name}`, result => {


      test.frontPhoto = result.secure_url;


      console.log(test.frontPhoto);
    });



    const uploadBack = await insurBackPhoto.mv(`${process.env.FILE_UPLOAD_PATH}/insurance/${insurBackPhoto.name}`, err => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 400)); // next func error response
      }
    });
    cloudinary.uploader.upload(`${process.env.FILE_UPLOAD_PATH}/insurance/${insurBackPhoto.name}`, result => {

      test.backPhoto = result.secure_url;
      console.log(`back photo url: ${test.backPhoto}`)

    });
    let surgHistoriesObj = [];
    const file = req.files.surgicalHistory;
    console.log(`file object: ${file}`)
    console.log(`desc object: ${req.body.desc}`)
    for (let i = 0; i < file.length; i++) {
      let filename = file[i].name;

      const uploadSurgHist = await file[i].mv(`${process.env.FILE_UPLOAD_PATH}/surgical-history/${filename}`, function (err) {
        if (err) {
          res.send(err);
        }
      });
      cloudinary.uploader.upload(`${process.env.FILE_UPLOAD_PATH}/surgical-history/${filename}`, result => {

        // console.log(result);
        //patient.surgicalHistory = result.secure_url
        //console.log(`surgical hist url: ${test.surgicalHistory}`);

        var obj = {
          "desc": req.body.desc[i],
          "url": result.secure_url
        }
        surgHistoriesObj.push(obj);

        test.surgicalHistory = surgHistoriesObj;
        console.log(surgHistoriesObj);


        // removing the locally uploaded file using fs asynchronously
        fs.unlink(`${process.env.FILE_UPLOAD_PATH}/surgical-history/${filename}`, (err) => {
          if (err) {
            console.error(err)
            return
          }
        }); // end of file unlink


        //console.log(surgHistoriesObj);

      })

    }



    test.save();
    setTimeout(async () => {



    });




    res.status(200).json({
      success: true,
      message: 'Signup successful'
    });
  } catch (ex) {
    console.log('ex', ex);
  }
};

exports.getMeds = async (req, res, next) => {
  console.log('i am in get meds')
  try {
    const patient = await Patient.findOne({ "_id": req.user.data[1] })
    if (!patient) {
      return res.status(404).json({
        success: false,
        data: "No record found"
      })
    } else {
      return res.status(200).json({
        success: true,
        data: patient.currentMedications
      })
    }
  } catch (err) {
    console.log(" i am in catch block")
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getAllergies = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ "_id": req.user.data[1] })
    if (!patient) {
      res.status(404).json({
        success: false,
        data: "No record found"
      })
    } else {
      res.status(200).json({
        success: true,
        data: patient.allergies
      })
    }
  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getMedCondition = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ "_id": req.user.data[1] })
    if (!patient) {
      res.status(404).json({
        success: false,
        data: "No record found"
      })
    } else {
      res.status(200).json({
        success: true,
        data: patient.medicalConditions
      })
    }
  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getSurgicalHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ "_id": req.user.data[1] })
    if (!patient) {
      res.status(404).json({
        success: false,
        data: "No record found"
      })
    } else {
      res.status(200).json({
        success: true,
        data: patient.surgicalHistory
      })
    }
  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getFamilyHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ "_id": req.user.data[1] })
    if (!patient) {
      res.status(404).json({
        success: false,
        message: "No record found"
      })
    } else {
      res.status(200).json({
        success: true,
        data: patient.familyHistory
      })
    }
  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getSocialHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ "_id": req.user.data[1] })
    if (!patient) {
      res.status(404).json({
        success: false,
        data: "No record found"
      })
    } else {
      res.status(200).json({
        success: true,
        data: patient.socialHistory
      })
    }
  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getPharmacies = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ "_id": req.user.data[1] })
    if (!patient) {
      res.status(404).json({
        success: false,
        data: "No record found"
      })
    } else {
      res.status(200).json({
        success: true,
        data: patient.pharmacy
      })
    }
  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getInsuranceInfo = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ "_id": req.user.data[1] })
    if (!patient) {
      res.status(404).json({
        success: false,
        data: "No record found"
      })
    } else {
      res.status(200).json({
        success: true,
        data: patient.insurance
      })
    }
  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getAllPharmacies = async (req, res, next) => {

  try {
    const result = await Pharma.find({});
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (err) {
    next(new ErrorResposne(err.message, 500))
  }

}

exports.getPharmacy = async (req, res, next) => {

  try {
    let searchedName = req.params.name;

    const result = await Pharma.find({ "Name": { $regex: searchedName, $options: '$i' } });
    if (result === null) {
      res.status(200).json({
        success: true,
        data: "No pharmacies with this name exist"
      })
    } else {
      res.status(200).json({
        success: true,
        data: result
      });

    }

  } catch (ex) {
    next(new ErrorResposne(err.message, 500));
  }

}

exports.getOtherMeds = async (req, res, next) => {
  try {
    const searched = req.query.tbv;
    const data = await OtherMedConditions.find({ "LONG DESCRIPTION": { $regex: searched, $options: '$i' } });
    res.send(data)
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }

}

exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id }, { labs: 0, __v: 0 });

    if (!patient) {
      return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true, data: patient
    })

  } catch (err) {
    next(new ErrorResponse(`Patient not found.`, 404));

  }
}

exports.getPreviousTreatments = async (req, res, next) => {
  try {
    const prev = await Problem.find({ 'isChecked': true, "patientID": req.user.data[1] });
    if (!prev) {
      res.status(200).json({
        data: "No previous treatments",
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