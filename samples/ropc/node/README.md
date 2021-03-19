# ROPC

This sample shows how to use the IBM Security Verify SDK for JavaScript to:
 - Authenticate a user via IBM Security Verify using the the ROPC grant type.
 - Successfully make an API request to `userinfo` endpoint to return the authenticated users details.

<br>

![screenshot](screenshot.png)

## :rocket: Demo the sample app:
**If you've downloaded a sample application via the developer portal you can skip step one.**
1. Create a `.env` file with the following variables in place (remove secret if Public Client)
```
TENANT_URL=https://your-tenant-name.ice.ibmcloud.com
CLIENT_ID=a1b2c3d4-abcd-1234-0000-yourid
CLIENT_SECRET=yoursecret
FLOW_TYPE=ropc
SCOPE=openid
```

2. `npm install`
3. `npm run start`
4. In your CLI follow the prompts to authenticate.

Following successful authentication, authenticated user information will be returned.

## License

The MIT License (MIT)

Copyright (c) 2021 - IBM Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.