'use strict'

import Hackernews from './hackernews'

export default {
	init: (function () {
		let _app

		function createService(firebase) {
			if (!firebase) {
				throw new Error('hackernew() requires firebase app instance')
			}

			if (!_app)	{
				_app = new Hackernews(firebase)
			}

			return _app
		}

		return createService
	})()
}
