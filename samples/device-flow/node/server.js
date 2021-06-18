/*
 MIT License

Copyright (c) 2019, 2021 - IBM Corp.

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 and associated documentation files (the "Software"), to deal in the Software without restriction,
 including without limitation the rights to use, copy, modify, merge, publish, distribute,
 sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all copies or substantial
 portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
require('dotenv').config({path: './.env'});
const express = require('express');
const path = require('path');
const {OAuthContext} = require('ibm-verify-sdk');
const session = require('express-session');
const storage = require('node-persist');

const app = express();
app.use(session({
	secret: 'my-secret',
  resave: true,
  saveUninitialized: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

storage.init();

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


const verifyToken = async(req, res, next) => {

	const token = await storage.getItem(req.sessionID);
	if(token) {
		req.session.token = token;
		next();
	} else {
		res.redirect('/');
	}

}

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/authenticated', verifyToken, (req, res) => {
	console.log('======== Requesting userInfo claims using valid token');
		deviceFlow.userInfo(req.session.token)
		.then((response) => {
			res.render('authenticated', {message: 'successfully authenticated', userInfo: response.response});
		}).catch((err) => {
			res.send(err);
		});
});

app.get('/authorize', (req, res) => {
	console.log('======== Calling device_authorization endpoint')
		deviceFlow.authorize()
			.then((response) => {
				console.log('======== API response: ', response);
				res.render('authorize', {
					userCode: response.user_code,
					verificationUri: response.verification_uri,
					qrCode: response.verification_uri_complete_qrcode
				}, pollToken(response.device_code, req.sessionID));
			})
			.catch((error)=> {
				console.log("========= API error trying to call device_authorization endpoint:", error);
			});
});

app.get('/logout', async(req, res) => {
	if(!req.session.token){
		console.log('======== No token stored in session')
		res.redirect('/');
		return;
	}
	console.log('======== Attempting to revoke access_token');
	deviceFlow.revokeToken(req.session.token, 'access_token')
	.then(async() => {
		console.log('======== Successfully revoked access token');
		await storage.removeItem(req.sessionID);
		console.log('======== Removing token session from storage');
		res.redirect(302, '/')
	})
	.catch((error) => {
		console.log('========= Token revocation error: ', error)
	})
})

io.on('connection', function(socket) {
	console.log('node client connected');
	socket.on('disconnect', function() {
		console.log('client disconnected');
	});
});


function pollToken(device_code, sessionID ) {
	let deviceCode = device_code;
	let timeoutInterval = 5000;
	console.log("========= Polling token api");
	deviceFlow.pollTokenApi(deviceCode, timeoutInterval)
	.then(async(response) => {
		console.log('========= Token response object: ', response);
		try {
			await storage.setItem(sessionID, {...response});
			await io.emit('success', {auth: '/authenticated'});
		} catch (error) {
			console.log('========= Error setting sotrage for session');
			return error;
		}
	})
	.catch((err) => {
		console.log('========= Polling error: ', err);
	});
}

http.listen(3000, () => {
	console.log('Server started');
	console.log('Navigate to http://localhost:3000');
});
