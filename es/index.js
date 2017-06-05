'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var firebase = require('firebase/app');
var _ = require('firebase/database');
var HNFirebase = require('../hn-firebase');

exports.default = function (firebase) {
	var _app = void 0;

	function createService() {
		if (!_app) {
			_app = new HNFirebase(firebase);
		}

		return _app;
	}

	return createService;
}(firebase);
