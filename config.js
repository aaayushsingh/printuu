exports.version="0.0.1";
require("dotenv").config();

module.exports = {
    "database":{
        "url": process.env.DB_URL,
        "name": process.env.DB_NAME
    }
}