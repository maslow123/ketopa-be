'use strict';
require('dotenv').config();
var mysql = require('mysql2-promise')();

mysql.configure({
  host: "localhost",
  user: "root",
  password: "",
  database: 'apotek'

});

module.exports = mysql;