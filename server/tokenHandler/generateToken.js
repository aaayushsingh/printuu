"use strict";
const random = require("node-random");
const mongo = require("./../database/mongo.js");
const config = require("./../../config.js");

function getToken(callback) {
    random.integers({
        "number": 1,
        "minimum": 1000,
        "maximum": 9999
    }, function (error, data) {
        if (error) {
            console.log(error);
        }
        else {
            mongo.find({ "token": data }, "events", function (err, result) {
                if (err) {
                    console.log(err);
                    callback(err);
                }
                else if (result.length == 0) {
                    console.log("unique token no. found");
                    callback(null, data);
                }
                else {
                    console.log("This number already exists. Finding another.");
                    getToken(callback);
                }
            });
        }
    });

}

module.exports = getToken;