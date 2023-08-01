"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = {
    randomString: function (length) {
        const randomCharset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';
        let random = '';
        for (let c = 0, cl = randomCharset.length; c < length; ++c) {
            random += randomCharset[Math.floor(Math.random() * cl)];
        }
        return random;
    },
    dateString: function (value) {
        const dateData = value;
        const dateObject = new Date(Date.parse(dateData));
        const dateReadable = dateObject.toDateString();
        return dateReadable;
    },
    isNode: function () {
        try {
            return Object.prototype.toString.call(global.process) === '[object process]';
        }
        catch (e) {
            return false;
        }
    },
    isToken: function (token) {
        if (!token || !token.access_token) {
            return false;
        }
        return true;
    },
    sleep: function (duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    },
    isUrl: function (url) {
        const valid = url.startsWith('https://') || url.startsWith('http://');
        return valid;
    }
};
exports.default = utils;
//# sourceMappingURL=utils.js.map