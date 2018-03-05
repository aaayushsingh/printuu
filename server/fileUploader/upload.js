"use strict";
const mongo = require("./../database/mongo.js");
const config = require("./../../config.js");
const aws = require("aws-sdk");
const getToken = require("./../tokenHandler/generateToken.js");



module.exports = function (req, res) {
    console.log(req.method + " request received at " + req.url);
    var s3 = new aws.S3({ signatureVersion: 'v4', region: 'us-east-2' });
    const S3_BUCKET = config.aws.bucket_name;
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];

    getToken(function (error, token) {
        if (error) {
            console.log(error);
            res.write({ "Error": "Database error" });
            res.end();
        }
        else {
            var finalFileName = token + '-' + fileName;
            const s3Params = {
                Bucket: S3_BUCKET,
                Key: finalFileName,
                Expires: 60,
                ContentType: fileType,
                ACL: 'public-read'
            };
            s3.getSignedUrl('putObject', s3Params, function (err, data) {
                if (err) {
                    console.log(err);
                    res.sendStatus(404);
                    res.end();
                }
                else {
                    console.log("Signed request generated.");

                    var base = {
                        "name": req.query.name,
                        "e-mail": req.query.mail,
                        "token": token,
                        "url": `https://${S3_BUCKET}.s3.amazonaws.com/${finalFileName}`
                    };
                    mongo.insert(base, "developers", function (err, result) {
                        if (err) {
                            console.log("ERROR", err);
                            res.sendStatus(404);
                        }
                        else {
                            console.log("Values inserted in DB successfully");
                            const returnData = {
                                signedRequest: data,
                                url: `https://${S3_BUCKET}.s3.amazonaws.com/${finalFileName}`,
                                token: token,
                                file: fileName
                            };

                            res.write(JSON.stringify(returnData));
                            res.end();
                        }
                    });
                }
            });

        }
    });

}