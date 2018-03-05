"use strict";
var config = require("./../../config.js");
var MongoClient = require("mongodb").MongoClient;

var url = config.database.url;
var dbName = config.database.name;
exports.insert = function () { };
exports.find = function () { };

MongoClient.connect(url, function (err, client) {
    if (err) {
        console.log('Error connecting to the database', err);
    }
    else {
        console.log('Succesfully connected to the database');
        var db = client.db(dbName);

        exports.insert = function (data, collection, callback) {
            var collection = db.collection(collection);
            collection.insert(data, function (err, result) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, 'success');
                }
            });
        }

        exports.find = function (data, collection, callback) {
            var collection = db.collection(collection);
            collection.find(data).toArray(function (err, result) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, result);
                }
            });
        }

    }
});