
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimiter = require('./middleware/rateLimiter');
//const logger = require('./middleware/logger');
//const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config();
const app = express();


mongoose.connect(process.env.MONGODB_URI)
    .then(()=> console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error;', err));


app.use(express.json());
//app.use(logger);
// app.use(validator);

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.use(cors());
app.use(morgan('combined'));
app.use(rateLimiter);

app.get('/health', (req, res) => {
    res.send({ status: 'ok' });
});

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.use('/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);
//app.use(errorHandler); // add it after all the routes in the end only

const PORT = process.env.PORT || '3000';
app.listen(PORT, () => {
    console.log(`server listening on ${PORT}`)
})