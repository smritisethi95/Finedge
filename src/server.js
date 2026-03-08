
// MUST load dotenv FIRST before requiring app
require('dotenv').config();

// const dns = require('node:dns');
// dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
    if(err) {
        return console.log("Something bad has happened", err);
    }
    console.log(`Application has started on http://localhost:${PORT}`);
});
