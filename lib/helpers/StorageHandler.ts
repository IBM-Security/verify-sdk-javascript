/**
 * @function StorageHandler
 * StorageHandler functionality to handle browser storage with 'Implicit flow'
 * @param {string} storageType Set via config obj options: 'sessionStorage, localStorage, cookies'
 * @returns get and set type methods for handling storage
 */

import { IToken } from '.';


function StorageHandler(storageType: Storage) {
	let storage = setStorageMethod(storageType);

	function setStorage(obj: IToken) {
		try {
			let token = {} as IToken;

			if (obj.id_token){
				token.id_token = obj.id_token;
			}
			if (obj.access_token){
				let expiresIn = JSON.stringify(obj.expires_in as number * 1000 + new Date().getTime());
				token.access_token = obj.access_token;
				token.expires_in = expiresIn;
			}

			storage.setItem('token', JSON.stringify(token));
		} catch (error) {
			throw new Error('Unable to set browser storage ' + error);
		}
	}

	function getStorage(opt: string): string | null | Error {
		try {
			return storage.getItem(opt);
		} catch (error) {
			throw new Error('Unable to get storage ' + error);
		}
	}

	function clearStorage() {
		console.log('Browser storage cleared');
		return storage.removeItem('token');
	}
	return {
		setStorage: setStorage,
		getStorage: getStorage,
		clearStorage: clearStorage
	};
}
const setStorageMethod = (storageType: Storage) => {
	switch (storageType) {
	case localStorage:
		if (!supportsLocalStorage()) {
			console.log("Browser doesn't support localStorage");
			break;
		}
		return localStorage;
	case sessionStorage:
		if (!supportsSessionStorage()) {
			console.log("Browser doesn't support sessionStorage");
			break;
		}
		return sessionStorage;

	default:
		console.warn(`Error setting browser storage using ${storageType}`);
	}
	throw new Error(
		'Unable to set storage, check your config settings. valid options [sessionStorage, localStorage]'
	);
};

/**
 *
 * Returns true or false if browser supports sessionStorage
 */
const supportsSessionStorage = () => {
	try {
		if (!window.sessionStorage) {
			return false;
		}
		window.sessionStorage.setItem('storageTest', 'storageValue');
		if (window.sessionStorage.getItem('storageTest') !== 'storageValue') {
			return false;
		}
		window.sessionStorage.removeItem('storageTest');
		if (window.sessionStorage.getItem('storageTest')) {
			return false;
		}
		return true;
	} catch (error) {
		return false;
	}
};
/**
 *
 * Returns true or false if browser supports localStorage
 */
const supportsLocalStorage = () => {
	try {
		if (!window.localStorage) {
			return false;
		}
		window.localStorage.setItem('storageTest', 'storageValue');
		if (window.localStorage.getItem('storageTest') !== 'storageValue') {
			return false;
		}
		window.localStorage.removeItem('storageTest');
		if (window.localStorage.getItem('storageTest')) {
			return false;
		}
		return true;
	} catch (error) {
		return false;
	}
};

export default StorageHandler;
