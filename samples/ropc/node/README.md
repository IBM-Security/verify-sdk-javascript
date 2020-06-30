# ROPC

This sample shows how to use the SDK to authenticate a user via Cloud Identity using the the ROPC grant.

<br>

![screenshot](screenshot.png)

## To run the example

In your project folder:
- Create a `.env` file with the following variables in place (remove secret if Public Client):
```
TENANT_URL=https://your-tenant-name.ice.ibmcloud.com
CLIENT_ID=a1b2c3d4-abcd-1234-0000-yourid
CLIENT_SECRET=yoursecret
FLOW_TYPE=ropc
SCOPE=openid
```

From your CLI (Command Line Interface), at the root of your project:
- `npm install`
- `node ropc-sample.js`
- Enter user credentials when prompted

Following successful authentication, authenticated user information will be returned.

## License

The MIT License (MIT)

Copyright (c) 2020 IBM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.