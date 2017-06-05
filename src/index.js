const firebase = require('firebase')
const HNFirebase = require('./hn-firebase')

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
