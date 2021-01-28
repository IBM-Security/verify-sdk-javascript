import { IToken, IUtils } from './interfaces';

const utils: IUtils = {
	/**
	 * return random string with a given length
	 */
	randomString: function(length: number): string {
		const randomCharset: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';
		let random: string = '';
		for (let c = 0, cl = randomCharset.length; c < length; ++c) {
			random += randomCharset[Math.floor(Math.random() * cl)];
		}
		return random;
	},

	/**
	 * return readable date string of the given value
	 */
	dateString: function(value: string): string {
		const dateData: string = value;
		const dateObject: Date = new Date(Date.parse(dateData));
		const dateReadable: string = dateObject.toDateString();

		return dateReadable;
	},

	/**
	 * return boolean to detect if we're in a node env or browser based.
	 */
	isNode: function(): boolean {
		try {
			return Object.prototype.toString.call(global.process) === '[object process]';
		} catch (e) {
			return  false;
		}
	},
	/**
	 * return boolean to detect if the object has an accessToken
	 */
	isToken: function(token: IToken): boolean {
		if (!token || !token.access_token) {
			return false;
		}
		return true;
	},

	/**
	 * sleeps execution for the given duration
	 */
	sleep: function(duration: number): Promise<void> {
		return new Promise(resolve => {
			setTimeout(resolve, duration);
		});
	},

	/*
	 * returns whether or not the string begins with 'http(s)://'
	 */
	isUrl: function(url: string): boolean {
		const valid = url.startsWith('https://') || url.startsWith('http://');

		return valid;
	}
};

export default utils;