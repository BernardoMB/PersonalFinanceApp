const express = require('express');
const fs = require('fs')
const _ = require('lodash');

var app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}`;
    console.log(log);
    fs.appendFile('server.log', log + '\n', (err) => {
        if (err) {
            console.log('Unable to append to server.log.');
        }
    });
    next();
});

app.use(express.static(__dirname));

app.get('/main', (req, res) => {
    
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});