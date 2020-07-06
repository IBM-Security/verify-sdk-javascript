require('dotenv').config({path: './.env'});
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const OAuthContext = require('ibm-verify-sdk').OAuthContext;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const http = require('http').Server(app);
const io = require('socket.io')(http);


let config = {
	tenantUrl : process.env.TENANT_URL,
	clientId : process.env.CLIENT_ID,
	clientSecret : process.env.CLIENT_SECRET,
	flowType : process.env.FLOW_TYPE,
	scope : process.env.SCOPE
};

let deviceFlow = new OAuthContext(config);

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/authenticated', (req, res) => {
	res.render('authenticated', {
		message: 'successfully authenticated'
	});
});

app.get('/authorize', (req, res) => {
	deviceFlow.authorize()
		.then((response) => {
			res.render('authorize', {
				userCode: response.user_code,
				verificationUri: response.verification_uri,
				qrCode: response.verification_uri_complete_qrcode
			}, pollToken(response.device_code));
		})
		.catch(error => {
			console.log(error);
		});
});

io.on('connection', function(socket) {
	console.log('node client connected');
	socket.on('disconnect', function() {
		console.log('client disconnected');
	});
});


function pollToken(device_code) {
	let deviceCode = device_code;
	let timeoutInterval = 5000;
	deviceFlow.pollTokenApi(deviceCode, timeoutInterval)
		.then(() => {
			io.emit('success', {auth: '/authenticated'});
		})
		.catch((err) => {
			console.log('polling error: ', err);
		});
}

http.listen(3000, () => {
	console.log('listening on port: 3000');
});
