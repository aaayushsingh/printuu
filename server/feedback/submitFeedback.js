"use strict";
const mongo = require("./../database/mongo.js");
const config = require("./../../config.js");

module.exports = function (req, res) {
    console.log(req.method + " request received on " + req.url);
    mongo.insert(req.body, "ls_wale", function (err, resp) {
        if (err) {
            res.write("Sorry, could not submit the feedback right now. Please try again later.");
            res.end();
        }
        else {
            res.write("Entry submitted succesfully");
            res.end();
        }
    });
}