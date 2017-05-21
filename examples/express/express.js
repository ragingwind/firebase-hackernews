'use strict'

const path = require('path')
const express = require('express')
const hackernews = require('../../')

const app = express()
const news = hackernews()
const watchmode = process.argv.includes('--watch')
const index = `
<ul>
	<li><a href="/stories/top">top</a></li>
	<li><a href="/stories/new">new</a></li>
	<li><a href="/stories/best">best</a></li>
	<li><a href="/stories/ask">ask</a></li>
	<li><a href="/stories/show">show</a></li>
	<li><a href="/stories/job">job</a></li>
	<li><a href="/users/jl">users/jl</a></li>
	<li><a href="/maxitem">maxitem</a></li>
	<li><a href="/updates">updates</a></li>
</ui>`

app.get('/', (req, res) => {
	res.send(index)
})

app.get('/stories/:type', (req, res) => {
	news.stories(req.params.type).then(data => res.send(data))
})

app.get('/users/:id', (req, res) => {
	news.user(req.params.id).then(data => res.send(data))
})

app.get('/maxitem', (req, res) => {
	news.maxItem().then(data => res.send(`maxitem: ${data}`))
})

app.get('/updates', (req, res) => {
	news.update().then(data => res.send(data))
})

app.use('/hackernews', express.static(path.join(path.resolve(__dirname, '../'))))

Promise.resolve(watchmode && news.watch()).then(() => {
	app.listen(3000, () => {
		console.log(`server has started with ${watchmode ? 'watch' : 'fetch'} mode`)
	})
})
