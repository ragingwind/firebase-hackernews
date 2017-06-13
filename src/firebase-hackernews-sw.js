/* global self URL Response */
import Hackernews from './hackernews'

let hackernews

function responseWithJSON(data) {
	return new Response(JSON.stringify(data), {
		headers: {'Content-Type': 'application/json'}
	})
}

function handleRequest(url) {
	const subpath = url.pathname.replace('/hackernews/', '').split('/')
	const type = subpath[0]
	const params = subpath[1]

	if (type === 'user') {
		return hackernews.user(params)
	} else if (type === 'item') {
		return hackernews.items(params)
	} else if (type === 'kids') {
		return hackernews.kids(params)
	} else if (/top|new|best|ask|show|job/.test(type)) {
		return hackernews.stories(type, {page: params || 1})
	}

	Promise.reject(new Error(`invalid type, ${type}`))
}

function init(firebase, opts) {
	opts = Object.assign({
		watch: false
	}, opts)

	hackernews = new Hackernews(firebase)

	self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))

	self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

	self.addEventListener('fetch', event => {
		const url = new URL(event.request.url)

		if (url.pathname.startsWith('/hackernews/')) {
			event.respondWith(handleRequest(url).then(data => {
				return responseWithJSON({data})
			}))
		}
	})

	hackernews.watch(opts.watch).then(() => {
		self.clients.matchAll({
			type: 'window',
			includeUncontrolled: true
		}).then(clients => {
			clients.forEach(client => {
				client.postMessage({
					target: 'firebase-hackernews-sw',
					type: 'ready'
				})
			})
		})
	})
}

self.hackernews = {
	init
}
