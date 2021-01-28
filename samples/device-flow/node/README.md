# Device Flow

This sample shows how to use the SDK to
* Authenticate a user via IBM Security Verify using the the device flow authorization grant

<br>

![screenshot](screenshot.png)

To run the example

- configure your .env file variables. You can refer to the .env.example file with the required variables to run this sample.
- npm install
- npm start
- navigate to `http://localhost:3000` in your browser

## User flow
- Click the `Authorize` button to call the Authorization server to retrieve a valid device code.
- Copy the code and goto the provided link to authenticate using the device code or use a secondary device to scan the QR code for a better user experience.
- The application begins polling the authorization server for a valid access token
- When the authentication process is complete you can use the valid access token to to call your API and retrieve requested data.
￼
The IBM Verify Javascript SDK also supports the ability to manage IBM Verify registration profiles. You can read more about how this is implemented [here](http://developer.ice.ibmcloud.com/verify/javascript/ibm-verify-sdk-object-model/authenticator-context).


## License

The MIT License (MIT)

Copyright (c) 2019, 2021 - IBM Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.