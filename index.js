"use strict";

require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
var config = require("./config.js");

var app = express();

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Process application/json
app.use(bodyParser.json());

//static files
app.use(express.static(__dirname + '/public/'));

//setting up the port
app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), function () {
    console.log('Server is running on port', app.get('port'))
});

//the below api is to display the photocopy printing page.
app.get('/printme', function (req, res) {
    console.log(req.method + " request received from " + req.url);
    res.sendFile(__dirname + '/getprint.html');
});

//the below url is for the data that i get from the photocopy wala
app.post('/sendprint', function (req, res) {
    console.log(req.method + " request received from " + req.url);
    //here i need to authenticate the origin of the request

    console.log(req.body);

    var temp = req.body.token;
    mongo.find({ token: parseInt(temp) }, "developers", function (err, result) {
        if (err) {
            console.log(err);
            res.json({ "message": "Error handling request. Please try again later.", "url": null });
            res.end();
        }
        else if (result.length == 0) {
            console.log("The token no. does not exist");
            res.json({ "message": "This token does not exist", "url": null });
            res.end();
        }
        else {
            console.log("The url that i have to hit on is...");
            console.log(result[0].url);

            res.json({ "message": "Your document is ready for printing.", "url": result[0].url });

            res.end();



        }
    });
});

require("./server/routes.js")(app,__dirname);

