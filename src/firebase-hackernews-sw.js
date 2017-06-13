/* global self URL Response */
import Hackernews from './hackernews'

const init = (() => {
	function responseWithJSON(data) {
		return new Response(JSON.stringify(data), {
			headers: {'Content-Type': 'application/json'}
		})
	}

	return function (firebase, opts) {
		opts = Object.assign({
			watch: false
		}, opts)

		const hackernews = new Hackernews(firebase)

		self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))

		self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

		self.addEventListener('fetch', event => {
			const url = new URL(event.request.url)

			if (url.pathname.startsWith('/hackernews/')) {
				event.respondWith(hackernews.fetch(url.pathname).then(data => {
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
})()

;(function (self) {
	self.hackernews = {
		init
	}
})(self)
