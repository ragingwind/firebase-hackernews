# firebase-hackernews [![Build Status](https://travis-ci.org/ragingwind/firebase-hackernews.svg?branch=master)](https://travis-ci.org/ragingwind/firebase-hackernews)

> Hacker News APIs with firebase

## Install

```
$ npm install --save firebase-hackernews
```

## Usage

See [more examples](./examples) in test.js and refer to [HackerNews API](https://github.com/HackerNews/API) for more information of firebase and

```js
const hackernews = require('firebase-hackernews');

// create a service as a single instance
const news = hackernews()

// get all of stories by types, 'top', 'new', 'best', 'ask', 'show', 'job'
news.stories('top').then(stories => {})

// get stories with custom count and page
news.stories('top', {page: 1, count: 30}).then(stories => {})

// get a user
news.user('jl').then(user => {})

// get a current max item id
news.maxItem().then(update => {})

// get a updated items and profiles
news.update().then(update => {})
```

## API

### hackernews()

Returns firebase service for Hacker News as a single instance

### stories(type, [options])

Returns stories after fetched and cached with options:

- force: true ? returns stories fetch first, else return cached data if it exist
- page: returns stories in page by count
- count: count in a page. default is 50

### user(id)

Returns profile by id

### updates()

Returns recent updates regardless fetched data

### maxItem()

Returnes max item id of latest snapshot on firebase

### watch()

Make the service keep listening on the changes of stories. It recommend to use it for desktop application and server side. refer to [the example with express.js](./examples/express)

## License

MIT © [Jimmy Moon](http://ragingwind.me)
