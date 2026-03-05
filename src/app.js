
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
//const logger = require('./middleware/logger');
//const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
const app = express();


mongoose.connect(process.env.MONGODB_URI)
    .then(()=> console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error;', err));


app.use(express.json());
//app.use(logger);
// app.use(validator);

app.get('/health', (req, res) => {
    res.send({ status: 'ok' });
});

app.use('/users', userRoutes);
//app.use(errorHandler); // add it after all the routes in the end only

const PORT = process.env.PORT || '3000';
app.listen(PORT, () => {
    console.log(`server listening on ${PORT}`)
})