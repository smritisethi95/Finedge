const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
    if(err) {
        return console.log("Something bad has happened", err);
    }
    console.log(`Application has started on http://localhost:${PORT}/health`);
});
