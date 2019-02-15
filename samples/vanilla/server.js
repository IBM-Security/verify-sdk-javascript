const express = require('express');
const app = express();

app.use(express.static(__dirname + '/front-end/'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/front-end/dashboard.html');
});

app.get('/authorize/callback', (req, res) => {
    res.sendFile(__dirname + '/front-end/dashboard.html');
});

app.listen(3000, () => {
    console.log('Server started');
});
