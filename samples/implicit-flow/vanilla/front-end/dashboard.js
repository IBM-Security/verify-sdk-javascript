let OAuthContext         = require('ibm-verify-sdk').OAuthContext;
let authClient = new OAuthContext(config);

if (window.location.pathname === config.REDIRECT_URI_ROUTE) {
	authClient.handleCallback();
	window.location.replace('/dashboard.html');
}

if (window.location.pathname === '/') {
	let url = authClient.login();
	window.location.replace(url);
}

if (window.location.pathname === '/dashboard.html') {
	$('#APIExplorer').prop('href', `${config.tenantUrl}/developer/explorer`);
	let token = authClient.fetchToken();
	authClient.userInfo(token)
		.then((result) => {
			document.getElementById('name').textContent = result.displayName;
			document.getElementById('user-info').textContent = JSON.stringify(result, null, 4);
		})
		.catch((error) => {
			return error;
		});
}


