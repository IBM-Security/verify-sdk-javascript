# React Sample

This sample shows how to use the IBM Security Verify SDK for JavaScript to:
- Authenticate a user via IBM Security Verify platform.
- Successfully make an API request to `userinfo` endpoint to return the authenticated users details.
<br>

![screenshot](screenshot.png)

## :rocket: Demo the sample app:
**If you've downloaded a sample application via the developer portal you skip step one.** :relieved:

1. Update the Config object in `config.js` with the appropriate configuration settings.
2. npm install
3. npm start
4. navigate to `http://localhost:3000` in your browser
 click `Login` on the top right corner to authenticate a user through IBM Security Verify
￼
This sample application uses￼ ￼[Implicit Flow](http://developer.ice.ibmcloud.com/verify/javascript/oauth/implicit-flow) to authenticate a user.

The IBM Verify Javascript SDK also supports the ability to manage IBM Verify registration profiles. You can read more about how this is implemented [here](http://developer.ice.ibmcloud.com/verify/javascript/ibm-verify-sdk-object-model/authenticator-context).


**note: if you're considering using your own custom application outside of IBM Secruity Verify's developer portal you need to add an additional configuration property to your `config.js` file.<br> Example below:**

The `REDIRECT_URI_ROUTE` value should be the path of your expected callback URL omitting the host or domain value.

```
REDIRECT_URI_ROUTE: '/auth/callback'
```

## License

The MIT License (MIT)

Copyright (c) 2019, 2021 - IBM Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.