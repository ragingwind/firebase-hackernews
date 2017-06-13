const HN_DATABASE_URL = 'https://hacker-news.firebaseio.com'
const HN_VERSION = 'v0'
const stamp = () => typeof window === 'object' ? performance.now() : Date.now()

class HNCache {
	constructor() {
		this.reset()
	}

	reset() {
		this._data = {
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
		this._data[type]._updated = stamp()
	}

	set(type, val) {
		if (Array.isArray(this._data[type])) {
			this._data[type] = val
		} else if (typeof this._data[type] === 'object') {
			this._data[type][val.id] = val
		} else {
			throw new TypeError(`Unsupported type ${type}`)
		}

		this.touch(type)
	}

	get(type) {
		return this._data[type]
	}

	exist(type) {
		if (Array.isArray(this._data[type])) {
			return this._data[type].length > 0
		} else if (typeof this._data[type] === 'object') {
			return Object.keys(this._data[type]) > 0
		}
		throw new Error(`Unsupported type ${type}`)
	}

	length(type) {
		return Array.isArray(this._data[type]) ?
			this._data[type].length :
			Object.keys(this._data[type]).length
	}

	cached(id) {
		// @todo: we need to check timestamp
		return this._data.items[id]
	}

	data(data) {
		if (data) {
			this._data = data
		}

		return this._data
	}
}

const STORIES = ['top', 'new', 'best', 'ask', 'show', 'job']

class Hackernews {
	constructor(firebase) {
		this._app = firebase.initializeApp({databaseURL: HN_DATABASE_URL}, 'hackernews')
		this._database = this._app.database()
		this._cache = new HNCache()
	}

	_defaultOption(opts, more) {
		return Object.assign({
			page: 1,
			count: 30
		}, more, opts)
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

	stories(type, opts) {
		if (!STORIES.includes(type)) {
			return new Error(`Invalid type of stories ${type}`)
		}

		opts = this._defaultOption(opts, {force: false})

		const fetch = () => {
			return this._fetch(`${type}stories`)
				.then(items => {
					this._cache.set(type, items)
				})
		}

		return Promise.resolve(opts.force ? false : this._cache.exist(type))
			.then(cached => Promise.resolve(cached ? true : fetch()))
			.then(() => this._getItems(type, opts))
	}

	_getItems(type, opts, sync) {
		const ids = this._cache.get(type)
		const begin = opts.page > 0 ? (opts.page - 1) * opts.count : 0
		const end = opts.page > 0 ? begin + opts.count : ids.length
		const items = ids.slice(begin, end)

		return sync === true ?
			this.itemsCached(items, opts) :
			this.items(items, opts)
	}

	items(ids, opts = {force: false}) {
		if (!Array.isArray(ids)) {
			ids = [ids]
		}

		return Promise.all(ids.map(id => {
			const item = opts.force ? undefined : this._cache.cached(id)
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
		return new Promise(resolve => {
			const res = {}
			const travelKids = ids => {
				if (ids && ids.length > 0) {
					return this.items(ids).then(items => {
						return Promise.all(
							items.map(i => {
								res[i.id] = i
								return travelKids(i.kids)
							})
						)
					})
				}
			}

			if (!this._cache.cached(id)) {
				resolve(res)
				return
			}

			travelKids(this._cache.cached(id).kids).then(() => {
				resolve(res)
			})
		})
	}

	data(data) {
		return new Promise(resolve => resolve(this._cache.data(data)))
	}

	itemsCached(ids) {
		if (!Array.isArray(ids)) {
			ids = [ids]
		}

		return ids.map(id => {
			return this._cache.cached(id)
		}).filter(item => item !== undefined)
	}

	storiesCached(type, opts) {
		if (!STORIES.includes(type)) {
			return new Error(`Invalid type of stories ${type}`)
		}

		return this._getItems(type, this._defaultOption(opts), true)
	}

	lengthCached(type) {
		return this._cache.length(type)
	}

	dataCached(data) {
		return this._cache.data(data)
	}

	fetch(pathname) {
		return new Promise((resolve, reject) => {
			const subpath = pathname.replace('/hackernews/', '').split('/')
			const type = subpath[0]
			const param = subpath[1]

			if (type === 'user' && param) {
				return this.user(param).then(resolve)
			} else if (type === 'item' && param) {
				return this.items(param && param).then(resolve)
			} else if (type === 'kids' && param) {
				return this.kids(param).then(resolve)
			} else if (/top|new|best|ask|show|job/.test(type)) {
				return this.stories(type, {page: param || 1}).then(resolve)
			}

			reject(new Error(`invalid type: ${type}, or params: ${param}`))
		})
	}
}

export default Hackernews
