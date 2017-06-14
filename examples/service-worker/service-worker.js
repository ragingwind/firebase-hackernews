/* global importScripts hackernews */
importScripts('https://www.gstatic.com/firebasejs/4.1.2/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/4.1.2/firebase-database.js')
importScripts('/firebase-hackernews-sw.js')

hackernews.init(firebase, {
	log: console.log,
	watch: true
})
