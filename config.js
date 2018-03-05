exports.version = "0.0.1";
require("dotenv").config();

module.exports = {
    "database": {
        "url": process.env.DB_URL,
        "name": process.env.DB_NAME
    },
    "aws": {
        "bucket_name": process.env.S3_BUCKET,
        "aws_secret": process.env.AWS_SECRET_ACCESS_KEY,
        "aws_id": process.env.AWS_ACCESS_KEY_ID
    }

}