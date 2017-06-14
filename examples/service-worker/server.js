const path = require('path')
const express = require('express')

const server = express()
const serve = (subpath, cache) => express.static(
  path.resolve(__dirname, subpath),
  {maxAge: cache && !dev ? 1000 * 60 * 60 * 24 * 30 : 0}
)

server.use('/firebase-hackernews-sw.js', serve('../../dist/firebase-hackernews-sw.js'))

server.use(serve('./'))

server.listen(3000, (err) => {
	if (err) throw err
		console.log('> Ready on http://localhost:3000')
})
