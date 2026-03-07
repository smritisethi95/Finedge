const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { requestLogger } = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
const app = express();


mongoose.connect(process.env.MONGODB_URI)
    .then(()=> console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error;', err));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
// app.use(validator);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running",
        timeStamp: new Date().toISOString()
    });
});

app.use('/users', userRoutes);
app.use(errorHandler);


module.exports = app;