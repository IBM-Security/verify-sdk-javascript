const express = require('express');
const session = require('express-session');
const {OAuthContext} = require('ibm-verify-sdk');
const path = require('path');
const app = express();

app.use(session({
  secret: 'my-secret',
  resave: true,
  saveUninitialized: false
}));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'front-end'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Home route
app.get('/', (req,res) => {
  if (req.session.token) {
    res.redirect("/dashboard");
  } else {
    res.render('index')
  }
});
app.get('/login', (req, res) => {
	authClient.authenticate().then(url => {
			res.redirect(url);
	}).catch(error => {
			res.send(error);
	})
})

app.get(process.env.REDIRECT_URI_ROUTE, (req, res) => {
	authClient.getToken(req.url).then(token => {
		token.expiry = new Date().getTime() + (token.expires_in * 1000);
		req.session.token = token;
		res.redirect('/dashboard');
	}).catch(error => {
			res.send("ERROR: " + error);
	});
});


app.get('/dashboard', (req, res) => {
	if(req.session.token){
		authClient.userInfo(req.session.token)
			.then((response) => {
				res.render('dashboard', {userInfo :response.response});
			}).catch((err) => {
				res.json(err);
			});
	} else {
		console.log('no token')
		res.redirect('/login')
	}
})

// delete token from storage when logging out
app.get('/logout', (req, res) => {
	authClient.revokeToken(req.session.token, 'access_token')
	 .then(() => {
			delete req.session.token;;
			res.redirect('/');
	 })
	 .catch((err) => {
		 res.send(JSON.parse(JSON.stringify(err)));
	 })
});


app.listen(3000, () => {
	console.log('Server started');
	console.log('Navigate to http://localhost:3000');
});