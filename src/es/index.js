'use strict'

const firebase = require('firebase/app')
try {
	const _ = require('firebase/database');
} catch (err) {
	// manage erros raised from firebase
	// database' already registered (app/duplicate-service).)
}
const HNFirebase = require('../hn-firebase')

module.exports = (function (firebase) {
	let _app

	function createService() {
		if (!_app)	{
			_app = new HNFirebase(firebase)
		}

		return _app
	}

	return createService
})(firebase)
