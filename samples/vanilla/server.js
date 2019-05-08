const express    = require('express');
const { config } = require('config.js');
const app        = express();

app.use(express.static(__dirname + '/front-end/'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/front-end/dashboard.html');
});

app.get(config.REDIRECT_URI, (req, res) => {
    res.sendFile(__dirname + '/front-end/dashboard.html');
});

app.listen(3000, () => {
    console.log('Server started');
});
