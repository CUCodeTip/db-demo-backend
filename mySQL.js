const mysql = require('mysql');
const fs = require('fs');

require('dotenv').config();

const mysqlHost = process.env.MYSQL_HOST;
const mysqlPort = process.env.MYSQL_PORT;
const mysqlUser = process.env.MYSQL_USER;
const mysqlPW = process.env.MYSQL_PASSWORD;
const mysqlDB = process.env.MYSQL_DB;

const connection = mysql.createPool({
  host: mysqlHost,
  user: mysqlUser,
  password: mysqlPW,
  database: mysqlDB,
  port: mysqlPort,
  ssl: {
    ca: fs.readFileSync('./DigiCertGlobalRootCA.crt.pem'),
  },
});

module.exports = connection;
