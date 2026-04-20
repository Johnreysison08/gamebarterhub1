const mysql = require('mysql2');
const fs = require('fs');

const db = mysql.createConnection({
    host: 'mysql-285bf36-jhayrhousimon4-e71c.g.aivencloud.com',
    port: 27260,
    user: 'avnadmin',
    password: 'AVNS_i35jgZy2Ctdzw3v36wS',   // paste the exact password from Aiven
    database: 'game_barter_hub',
    ssl: {
        ca: fs.readFileSync('./certs/ca.pem'), // path to your cert
        rejectUnauthorized: true
    }
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL (Aiven)');
});

module.exports = db;
