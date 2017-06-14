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
			watch: false,
			log: () => {}
		}, opts)

		opts.log((`hn:sw: passed opts, ${JSON.stringify(opts)}`))

		const hackernews = new Hackernews(firebase, opts)

		self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))

		self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

		self.addEventListener('fetch', event => {
			const url = new URL(event.request.url)

			if (url.pathname.startsWith('/hackernews/')) {
				opts.log((`hn:sw: start hooking of fetch, ${url}`))
				event.respondWith(hackernews.fetch(url.pathname).then(data => {
					opts.log((`hn:sw: end hooking of fetch, ${JSON.stringify(data)}`))
					return responseWithJSON(data)
				}))
			}
		})

		if (opts.watch) {
			opts.log((`hn:sw: start watching ${opts.watch}`))
			hackernews.watch(opts.watch).then(() => {
				self.clients.matchAll({
					type: 'window',
					includeUncontrolled: true
				}).then(clients => {
					opts.log((`hn:sw: end watching`))
					clients.forEach(client => {
						client.postMessage({
							target: 'firebase-hackernews-sw',
							type: 'ready'
						})
					})
				})
			})
		}
	}
})()

;(function (self) {
	self.hackernews = {
		init
	}
})(self)
