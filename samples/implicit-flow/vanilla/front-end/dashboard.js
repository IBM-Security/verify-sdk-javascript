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
let {OAuthContext} = require('ibm-verify-sdk');
let authClient = new OAuthContext(config);

if (window.location.pathname === config.REDIRECT_URI_ROUTE) {
	authClient.handleCallback();
	window.location.replace('/dashboard.html');
}

if (window.location.pathname === '/') {
	let url = authClient.login();
	document.getElementById('login').href=url;
}

if (window.location.pathname === '/dashboard.html') {
	let token = authClient.fetchToken();

	const logoutButton = document.getElementById('logout');
	logoutButton.addEventListener('click', function(event){
		event.preventDefault();
		authClient.logout();
	})

	const table = document.getElementsByClassName('table')[0];
	const hiddenEls = document.querySelectorAll('.invisible');

	authClient.userInfo(token)
		.then((result) => {
			const userInfo = result;
			document.getElementById('welcome').textContent = `Welcome ${userInfo.displayName}`;
			const tbodyEl = document.getElementById('user-info');
			table.classList.remove('hidden');
			for(const el in userInfo) {
				const row = document.createElement("tr");
				for(var i = 0; i < 2; i++){
					const cell = document.createElement('td');
					if(i === 0){
						if(el === 'ext'){
							cell.textContent = 'tenantId'
						} else {
							cell.textContent = el;
						}
					} else {
						if(el === 'ext'){
							cell.textContent = userInfo.ext.tenantId
						} else {
							cell.textContent = userInfo[el];
						}
					}
					row.appendChild(cell);
				}
				tbodyEl.appendChild(row);
			}

			for(var j = 0; j < hiddenEls.length; j++){
				hiddenEls[j].classList.remove('invisible');
			}

		})
		.catch((error) => {
			return error;
		})
		.finally(() => {
			document.getElementById('spinner-wrapper').remove();
		});
}


