"use strict";
const mongo = require("./../database/mongo.js");
const config = require("./../../config.js");

module.exports = function (req, res) {
    console.log(req.method + " request received from " + req.url);
    var temp = req.body.token;
    mongo.find({ token: parseInt(temp) }, "developers", function (err, result) {
        if (err) {
            console.log(err);
            res.json({ "message": "Error handling request. Please try again later.", "url": null });
            res.end();
        }
        else if (result.length == 0) {
            console.log("The token number does not exist");
            res.json({ "message": "This token does not exist", "url": null });
            res.end();
        }
        else {
            res.json({ "message": "Your document is ready for printing.", "url": result[0].url });
            res.end();
        }
    });
}