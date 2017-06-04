'use strict'

const Firebase = require('firebase')

const HN_DATABASE_URL = 'https://hacker-news.firebaseio.com'
const HN_VERSION = 'v0'
const stamp = () => typeof window === 'object' ? performance.now() : Date.now()

class HNFirebaseCache {
	constructor() {
		this.reset()
	}

	reset() {
		this.data = {
			items: {},
			top: [],
			new: [],
			best: [],
			ask: [],
			show: [],
			job: [],
			users: {}
		}
	}

	touch(type) {
		this.data[type]._updated = stamp()
	}

	set(type, val) {
		if (Array.isArray(this.data[type])) {
			this.data[type] = val
		} else if (typeof this.data[type] === 'object') {
			this.data[type][val.id] = val
		} else {
			throw new Error(`Unsupported type ${type}`)
		}

		this.touch(type)
	}

	get(type) {
		return this.data[type]
	}

	exist(type) {
		if (Array.isArray(this.data[type])) {
			return this.data[type].length > 0
		} else if (typeof this.data[type] === 'object') {
			return Object.keys(this.data[type]) > 0
		}
		throw new Error(`Unsupported type ${type}`)
	}

	length(type) {
		return Array.isArray(this.data[type]) ?
			this.data[type].length :
			Object.keys(this.data[type]).length
	}

	cached(id) {
		// @todo: we need to check timestamp
		return this.data.items[id]
	}
}

const STORIES = ['top', 'new', 'best', 'ask', 'show', 'job']

class HNFirebase {
	constructor() {
		Firebase.initializeApp({databaseURL: HN_DATABASE_URL})

		this._database = Firebase.database()
		this._cache = new HNFirebaseCache()
	}

	_getItems(type, opts) {
		const ids = this._cache.get(type)
		const begin = opts.page > 0 ? (opts.page - 1) * opts.count : 0
		const end = opts.page > 0 ? begin + opts.count : ids.length

		return this.items(ids.slice(begin, end))
	}

	_fetch(param) {
		return new Promise((resolve, reject) => {
			this._database.ref(`${HN_VERSION}/${param}`).once('value', s => {
				resolve(s.val())
			}).catch(err => {
				console.error(err)
				reject(err)
			})
		})
	}

	_fetchStorie(type, opts) {
		const fetch = () => {
			return this._fetch(`${type}stories`)
				.then(items => this._cache.set(type, items))
		}

		return Promise.resolve(opts.force ? false : this._cache.exist(type))
			.then(cached => Promise.resolve(cached ? true : fetch()))
			.then(() => this._getItems(type, opts))
	}

	stories(type, opts) {
		if (!STORIES.includes(type)) {
			return new Error(`Invalid type of stories ${type}`)
		}

		opts = Object.assign({
			force: false,
			page: 1,
			count: 30
		}, opts)

		return this._fetchStorie(type, opts).then(items => {
			items.totalLength = this._cache.length(type)
			return items
		})
	}

	items(ids, opts = {force: false}) {
		if (!Array.isArray(ids)) {
			ids = [ids]
		}

		return Promise.all(ids.map(id => {
			let item = opts.force ? undefined : this._cache.cached(id)
			return item ? Promise.resolve(item) : this._fetch(`item/${id}`)
		})).then(items => {
			items.forEach(i => this._cache.set('items', i))
			return items
		})
	}

	user(id, opts = {force: false}) {
		const fetch = () => {
			return this._fetch(`user/${id}`)
				.then(user => this._cache.set('users', user))
		}

		return Promise.resolve(opts.force ? false : this._cache.exist('users'))
			.then(cached => Promise.resolve(cached ? true : fetch()))
			.then(() => this._cache.get('users')[id])
	}

	maxItem() {
		return this._fetch('maxitem')
	}

	update() {
		return this._fetch('updates')
			.then(updates => {
				const req = updates.profiles.map(id => this.user(id, true))
					.concat(this.items(updates.items))

				return Promise.all(req)
					.then(() => {
						return updates
					})
			})
	}

	watch(on = true) {
		return new Promise(resolve => {
			const method = on ? 'on' : 'off'
			STORIES.forEach(type => {
				this._database.ref(`${HN_VERSION}/${type}stories`)[method]('value', s => {
					this._cache.set(type, s.val())
					resolve()
				})
			})
		})
	}

	length(type) {
		return new Promise(resolve => resolve(this._cache.length(type)))
	}

	kids(id) {
		const travelKids = ids => {
			if (ids && ids.length > 0) {
				return this.items(ids).then(items => Promise.all(
					items.map(i => travelKids(i.kids))
				))
			}
		}

		return travelKids(this._cache.cached(id).kids)
	}

	cached(id) {
		return this._cache.cached(id)
	}
}

module.exports = (function () {
	let _app

	function createService(opts) {
		if (!_app)	{
			_app = new HNFirebase(opts)
		}

		return _app
	}

	return createService
})()
