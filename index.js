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
app.use(express.static(__dirname + '/public'));

//setting up the port
app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), function () {
    console.log('Server is running on port', app.get('port'))
});

require("./server/routes.js")(app, __dirname);

