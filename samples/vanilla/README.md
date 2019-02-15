# Vanilla JS Sample

This sample shows how to use the SDK to 
* Authenticate a user through Cloud Identity
* Initiate an authenticator registration
* Query the user's authenticators
* Query an authenticator's methods
* Delete an authenticator
* Disable an authenticator's method

<br>

![screenshot](screenshot.png)

To run the example 

- Update the Config object in `front-end/dashboard.js` with the appropriate configuration settings.
  - Transpile `browserify front-end/dashboard.js > front-end/dashboard-transpile.js`
- npm install
- npm start
- navigate to `http://localhost:3000` in your browser


# Node.js

Handles routing to the file `dashboard.html`, a web server is required to use the SDK.


# Front-end

All of the logic is contained in the file `front-end/dashboard.js` it handles the authentication, token storage and sending requests to your application.

## License

The MIT License (MIT)

Copyright (c) 2019 IBM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.