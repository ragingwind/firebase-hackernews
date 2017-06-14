'use strict'

const path = require('path')
const express = require('express')
const firebase = require('firebase')
const hackernews = require('../../')

const server = express()
const hnservice = hackernews.init(firebase, {
	log: console.log
})
const watchmode = process.argv.includes('--watch')
const index = `
<ul>
	<li><a href="/hackernews/top">top</a></li>
	<li><a href="/hackernews/top/1">top at page 1</a></li>
	<li><a href="/hackernews/new">new</a></li>
	<li><a href="/hackernews/best">best</a></li>
	<li><a href="/hackernews/ask">ask</a></li>
	<li><a href="/hackernews/show">show</a></li>
	<li><a href="/hackernews/job">job</a></li>
	<li><a href="/hackernews/kids/14545382">kids/14545382</a></li>
	<li><a href="/hackernews/length/top">length/top</a></li>
	<li><a href="/hackernews/user/jl">users/jl</a></li>
</ui>`

server.get('/', (req, res) => {
	res.send(index)
})

server.get('/hackernews/*', (req, res) => {
	hnservice.fetch(req.path)
		.then(data => {
			res.send(typeof data === "number" ? String(data) : data)
		})
		.catch(err => {
			console.error(err)
			res.status(500).send(err.toString())
		})
})

Promise.resolve(watchmode && hnservice.watch()).then(() => {
	const PORT = 3001
	server.listen(PORT, () => {
		console.log(`server has started with ${watchmode ? 'watch' : 'fetch'} mode.` +
			` visit to http://localhost:${PORT}`)
	})
})
