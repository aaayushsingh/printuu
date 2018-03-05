var express = require('express');
var bodyParser = require('body-parser');
var random = require("node-random");
var request = require('request');
var pack = require('./package.json');
var aws = require('aws-sdk');
var MongoClient = require('mongodb').MongoClient;

var app = express();

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


// Process application/json
app.use(bodyParser.json());

//static files
app.use(express.static(__dirname + '/required/'));

//setting up the port
app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))

});

var S3_BUCKET = process.env.S3_BUCKET;

//The database essentials
var url = 'mongodb://jain:motherfathermother@ds133388.mlab.com:33388/printer_store';
var insert = function () { }
var ayush_insert = function () { }
var findus = function () { }

MongoClient.connect(url, function (err, client) {
    if (err) {
        console.log('Error connecting to the database');
        console.log(err);
    }
    else {
        console.log('database connected');
        var db = client.db("printer_store");

        insert = function (data, callback) {
            var collection = db.collection('developers');
            collection.insert(data, function (err1, result) {
                if (err1) {
                    callback(err1);
                }
                else {
                    callback(null, 'success');
                }
            });

        }

        findus = function (data, callme) {
            var collection = db.collection('developers');
            collection.find(data).toArray(function (err, result) {
                if (err)
                    callme(err);
                else
                    callme(null, result);
            });

        }


        ayush_insert = function (ayushdata) {
            var collection = db.collection('ls_wale');
            collection.insert(ayushdata, function (err2, result1) {
                if (err2) {
                    console.log(err2);

                }
                else {
                    console.log("Data Inserted successfully");
                }
            });
        }

    }
});


var accesstok = "chimp";
var refresh = pack.refresh;

app.get('/', function (req, res) {

    console.log(req.method + " request received at " + req.url);
    res.sendFile(__dirname + '/index.html');


});

app.get('/faq', function (req, res) {
    console.log(req.method + " request received at " + req.url);
    res.sendFile(__dirname + '/faq.html');

});


app.post('/feedback', function (req, res) {
    console.log(req.method + " request received on " + req.url);
    console.log(req.body);
    ayush_insert(req.body);
    res.write("Entry submitted succesfully");


    res.end();
});


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
            findus({ "token": data }, function (err, result) {
                if (err) {
                    console.log(err);

                    callback(err);
                }
                else if (result.length == 0) {
                    console.log("unique token no. found");
                    callback(null, data);
                }
                else {
                    console.log("this no. already exists. Trying again");
                    getToken(callback);
                }
            });
        }
    });

}

app.post('/todest', function (req, res) {
    console.log("Upolad request received...");
    var prick = 0;
    console.log(req.query);
    var s3 = new aws.S3({ signatureVersion: 'v4', region: 'us-east-2' });
    console.log("This is the s3 shit");


    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];

    getToken(function (error, data1) {
        if (error) {
            console.log(error);
            res.write({ "Error": "Sorry, database error" });
            res.end();
        }
        else {
            var prick = data1 + '-' + fileName;
            const s3Params = {
                Bucket: S3_BUCKET,
                Key: prick,
                Expires: 60,
                ContentType: fileType,
                ACL: 'public-read'
            };
            console.log("Generating signed request url...");
            s3.getSignedUrl('putObject', s3Params, function (err, data) {
                if (err) {
                    console.log("Yes we received an error");
                    console.log(err);
                    return res.end();
                }
                else {
                    console.log("Signed request generated.");
                    const returnData = {
                        signedRequest: data,
                        url: `https://${S3_BUCKET}.s3.amazonaws.com/${prick}`,
                        token: data1,
                        file: fileName
                    };
                    console.log('this is the signed request');
                    console.log(data);

                    res.write(JSON.stringify(returnData));//this is returning the signed request along with the url to the front end
                    res.end();

                    //This is where I will update the database.
                    var base = {
                        "name": req.query.name,
                        "e-mail": req.query.mail,
                        "token": data1,
                        "url": `https://${S3_BUCKET}.s3.amazonaws.com/${prick}`
                    };
                    insert(base, function (err123, result) {// used to insert values in the database
                        if (err123) {
                            console.log("Error code 2789");
                            console.log(err123);
                        }
                        else {
                            console.log("Values inserted in DB successfully");
                            //do whatever
                        }

                    });


                }
            });

        }
    });


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
    findus({ token: parseInt(temp) }, function (err, result) {
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


            /*
            drummer(function(error,token){    //this makes sure that we always have a valid access token
                if(error)
                {
                    console.log(error);
                    res.write("Error while printing your document");
                    res.end();
                }
                else
                {
                    console.log("We already have a valid token so moving ahead");
                    accesstok=token;
                    console.log(token);

                    //means we have a valid token.

                    //finally sending documents for printing
                    final_print(result[0].url,function(err1,retext){
                        if(err1)
                        {
                            console.log(err1);
                            res.write('Sorry, your document could not be printed');
                            res.end();
                        }
                        else
                        {
                            console.log(retext);
                            res.write('Document printed succesfully');
                            res.end();
                        }
                    });
                    }
            });*/
        }
    });
});


var drummer = function (callback) {
    request({
        url: 'https://www.google.com/cloudprint/jobs', //URL to hit

        method: 'GET', //Specify the method
        headers: { //We can define headers too
            'Authorization': 'Bearer ' + accesstok
        }
    }, function (error, response, body) {
        if (error) {
            callback(error);
        } else {
            console.log("The response received is...");
            var guess = body.split("");
            guess = body[1] + body[2] + body[3] + body[4];
            console.log(body);
            if (guess == 'HTML') {
                console.log("The previous token has expired so generating a new token");
                generate(callback);
            }
            else {
                callback(null, accesstok);
            }
            //var body=JSON.parse(body);
            //console.log(body.jobs[0]);

        }
    });

}

function generate(callback) {
    console.log('Generating a new token');
    request({
        url: 'https://www.googleapis.com/oauth2/v4/token', //URL to hit

        method: 'POST', //Specify the method
        qs: {
            'refresh_token': refresh,
            'client_id': '464334897725-u2cutivi4qkrmllv5v43hs5eshea52g6.apps.googleusercontent.com',
            'client_secret': 'TAwqUF9aCmOWn74nN4cR4KQI',
            'grant_type': 'refresh_token'
        }
    }, function (error, response, body) {
        if (error) {
            callback(error);
        }
        else {
            console.log("Token generated successfully...");
            var nati = JSON.parse(body);
            var nati = JSON.parse(body);
            callback(null, nati.access_token);
        }
    });
}

function final_print(address, callback) {
    request({
        url: 'https://www.google.com/cloudprint/submit?printerid=e13843f5-e7cf-cd80-1352-df3f24ad4f9e&title=for_fun1&content=' + address + '&contentType=url&copies=2', //URL to hit
        method: 'GET', //Specify the method
        headers: { //We can define headers too
            'Authorization': 'Bearer ' + accesstok
        }
    }, function (error, response, body) {
        if (error) {
            callback(error);
        } else {
            console.log("The response received is...");
            var guess = body.split("");
            guess = body[1] + body[2] + body[3] + body[4];
            console.log(body);
            if (guess == 'HTML') {
                console.log('error code 9782');
                callback("Unexpected error found. Please try later.");
            }
            else {
                callback(null, "Document sent for printing successfully");
            }

            console.log(body.jobs[0]);

        }
    });
}

app.get('/feedback', function (req, res) {
    console.log(req.method + " request received at " + req.url);

    res.sendFile(__dirname + '/feedback.html');
});
