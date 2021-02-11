const express              = require('express');
const bodyParser           = require('body-parser');
const cookieParser         = require('cookie-parser');                        // optional
const uuidv1               = require('uuid/v1');                              // optional
const {OAuthContext} = require('ibm-verify-sdk');
const path = require('path');
const app = express();

app.use(cookieParser('secret')); // optional
app.use(express.static('front-end'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// load contents of .env into process.env
require('dotenv').config();

const config = {
	tenantUrl            : process.env.TENANT_URL,
	clientId             : process.env.CLIENT_ID,
	clientSecret         : process.env.CLIENT_SECRET,
	redirectUri          : process.env.REDIRECT_URI,
	responseType         : process.env.RESPONSE_TYPE,
	flowType             : process.env.FLOW_TYPE,
	scope                : process.env.SCOPE
};

const authClient = new OAuthContext(config);

// using as an example, use a database in production
let usersToToken = [];
const getToken = (cookie_id) => {
	const token = usersToToken.filter((t => {
		if (t.id === cookie_id) {
			return t;
		}
	}))[0];
	return token ? token.token : undefined;
};
const removeToken = (id) => {
	usersToToken = usersToToken.filter(t => {
		if (t.id !== id) {return t;}
	});
};
const middlewareFunction = (req, res, next) => {
	// get cookie id
	const id = req.signedCookies.uuid;

	// search for the token associated with cookie id
	let token = getToken(id);

	let reauth = false;

	// if token was found in storage
	if (token) {
		// check if expired
		if (new Date().getTime() >= token.expires_in) {
			// check for refresh token
			if (token.refresh_token !== undefined) {
				authClient.refreshToken(token).then(t => {
					// update token (reference)
					token = t;
					token.id = id;
					// convert to milliseconds
					token.expires_in *= 1000;
					token.expires_in += new Date().getTime();
				}).catch(e => {
					console.log(e);
				});
			} else {
				// no refresh token so must re authenticate
				reauth = true;

				authClient.authenticate().then(url => {
					res.redirect(url);
				}).catch(error => {
					res.send(error);
				});
			}
		}
		// add the token to the req object
		req.token = token;

		if (!reauth) {next();}
	} else {
		authClient.authenticate().then(url => {
			res.redirect(url);
		}).catch(error => {
			res.send(error);
		});
	}
};
app.get('/', middlewareFunction, (req, res) => {
	res.sendFile(path.join(__dirname, '/front-end', 'dashboard.html'));
});
// user has authenticated through CI, now get the token
app.get(process.env.REDIRECT_URI_ROUTE, (req, res) => {
	authClient.getToken(req.url).then(token => {
		// check if this is a returning user
		let id = req.signedCookies.uuid;

		if (!id) {
			// generate id
			let uuid = uuidv1();
			// store id in signed cookie - expiry not working
			res.cookie('uuid', uuid, {signed: true});
		}

		// convert to milliseconds
		token.expires_in *= 1000;
		// update the expiry
		token.expires_in += new Date().getTime();

		// store and associate token to the user
		usersToToken.push({id: id, token: token});
		// redirect to root
		res.redirect('/');
	}).catch(error => {
		res.send('ERROR: ' + JSON.stringify(error, null, 4));
	});
});

// delete token from storage
app.get('/logout', middlewareFunction, (req, res) => {
	// get id from cookie
	const id = req.signedCookies.uuid;
	removeToken(id);
	res.redirect('/');
});

app.get('/api/userinfo', middlewareFunction, (req, res) => {
	authClient.userInfo(req.token)
		.then(r => {
			res.json(r);
		}).catch((err) => {
			res.json(err);
		});
});
app.listen(3000, () => {
	console.log('Server started');
	console.log('Navigate to http://localhost:3000');
});