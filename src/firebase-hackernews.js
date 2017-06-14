'use strict'

import Hackernews from './hackernews'

export const init = (function () {
	let _app

	function createService(firebase, opts) {
		if (!firebase) {
			throw new Error('hackernew() requires firebase app instance')
		}

		if (!_app)	{
			_app = new Hackernews(firebase, opts)
		}

		return _app
	}

	return createService
})()

export default {
	init
}
