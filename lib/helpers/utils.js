const utils = {
	/**
	 * return random string with a given length
	 */
	randomString: function (length) {
		var randomCharset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';
		var random = '';
		for (var c = 0, cl = randomCharset.length; c < length; ++c) {
			random += randomCharset[Math.floor(Math.random() * cl)];
		}
		return random;
	},

	/**
	 * return readable date string of the given value
	 */
	dateString: function (value) {
		let dateData = value;
		let dateObject = new Date(Date.parse(dateData));
		let dateReadable = dateObject.toDateString();

		return dateReadable;
	},
	/**
	 * return boolean to detect if we're in a node env or browser based.
	 */
	isNode: function () {
		let isNode;
		try {
			return isNode = Object.prototype.toString.call(global.process) === '[object process]';
		} catch (e) {
			return isNode = false;
		}
	},
	/**
	 * return boolean to detect if the object has an accessToken
	 */
	isToken: function (token) {
		if (!token || !token.access_token) {
			return false;
		}
		return true;
	},

	/**
	 * sleeps execution for the given duration
	 */
	sleep: function (duration) {
		return new Promise(resolve => {
			setTimeout(resolve, duration);
		});
	},

	/*
	 * returns whether or not the string begins with 'http(s)://'
	 */
	isUrl: function (url) {
		const valid = url.startsWith('https://') || url.startsWith('http://');

		return valid;
	}
};

export default utils;