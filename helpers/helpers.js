const cloudinary = require("cloudinary");
const fs = require('fs');
const Problem = require('../models/Problem');
const ErrorResponse = require('../utils/errorResponse');

exports.uploadImage = async (image, next) => {
    console.log('i was called')
    return new Promise((resolve, reject) => {
        if (!image.mimetype.startsWith('image')) {
            return next(new ErrorResponse(`Please upload an image file`, 400));
        }


        image.mv(`${process.env.FILE_UPLOAD_PATH}/insurance/${image.name}`, err => {
            if (err) {
                console.error(err);
                return next(new ErrorResponse(`Problem with file upload`, 400)); // next func error response
            }

            cloudinary.uploader.upload(`${process.env.FILE_UPLOAD_PATH}/insurance/${image.name}`, result => {
                const url = result.secure_url;
                const public_id = result.public_id;


                // removing the locally uploaded file using fs asynchronously
                fs.unlink(`${process.env.FILE_UPLOAD_PATH}/insurance/${image.name}`, (err) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                });
                resolve({
                    url, public_id
                })
            });
        });

    })

}

exports.destroyImage = (publicId) => {

    cloudinary.uploader.destroy(`${publicId}`, function (error, result) {
        if (error) {
            return true
        }
        return true
    })
}

exports.uploadPdf = async (pdf, next) => {
    console.log('pdf called')
    return new Promise(async (resolve, reject) => {
        if (pdf.mimetype !== 'application/pdf') {
            return next(new ErrorResponse(`Please upload a PDF file`, 400));
        }

        pdf.mv(`${process.env.FILE_UPLOAD_PATH}/insurance/${pdf.name}`, err => {
            if (err) {
                console.error(err);
                return next(new ErrorResponse(`Problem with PDF upload`, 400)); // next func error response
            }
            cloudinary.uploader.upload(`${process.env.FILE_UPLOAD_PATH}/insurance/${pdf.name}`, result => {
                const url = result.secure_url;
                const public_id = result.public_id;
                // removing the locally uploaded file using fs asynchronously
                fs.unlink(`${process.env.FILE_UPLOAD_PATH}/insurance/${pdf.name}`, (err) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                });
                resolve({
                    url, public_id
                })
            });
        });

    })

}

exports.getPatientNames = async (item) => {
    try {
        return new Promise(async (resolve, reject) => {
            const name = await Problem.findOne({ 'patientID': item })
            resolve(name.patientName)
        })
    }
    catch (e) {
        console.log(e)
    }
}