const mysql = require("mysql2");

const connection = mysql.createConnection({
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

module.exports = connection;
