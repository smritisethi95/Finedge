require('dotenv').config();
const express = require('express');
const app = express();
const errorHandler = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running",
        timeStamp: new Date().toISOString()
    });
});

app.use(errorHandler);


module.exports = app;
