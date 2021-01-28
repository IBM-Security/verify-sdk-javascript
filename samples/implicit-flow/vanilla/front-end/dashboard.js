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


