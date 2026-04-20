const express = require('express');
const db = require('./db');   // make sure you also created db.js earlier
const app = express();

// Example route: get all games
app.get('/games', (req, res) => {
    db.query('SELECT * FROM Games', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

// Get all games
app.get('/games', (req, res) => {
    db.query('SELECT * FROM Games', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Get all trades
app.get('/trades', (req, res) => {
    db.query('SELECT * FROM Trades', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Get all messages
app.get('/messages', (req, res) => {
    db.query('SELECT * FROM Messages', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Get all users
app.get('/users', (req, res) => {
    db.query('SELECT * FROM Users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});