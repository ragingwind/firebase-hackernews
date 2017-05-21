import test from 'ava'
import hackernews from './'

test('stroies', async t => {
	var news = hackernews()
	await Promise.all(['top', 'new', 'best', 'ask', 'show', 'job'].map(type => {
		return new Promise(async resolve => {
			const res = await news.stories(type)
			t.true(res.length > 0, 'returns resultful value')
			resolve()
		})
	}))
})

test('count of default', async t => {
	var news = hackernews()
	await Promise.all(['top', 'new', 'best', 'ask', 'show', 'job'].map(type => {
		return new Promise(async resolve => {
			const res = await news.stories(type, {
				page: 1
			})
			t.true(res.length > 0, 'returns resultful value')
			resolve()
		})
	}))
})

test('count of custom', async t => {
	var news = hackernews()
	await Promise.all(['top', 'new', 'best', 'ask', 'show', 'job'].map(type => {
		return new Promise(async resolve => {
			const res = await news.stories(type, {
				page: 1,
				count: 10
			})
			t.true(res.length === 10, 'returns resultful value')
			resolve()
		})
	}))
})

test('user', async t => {
	var news = hackernews()
	const user = await news.user('jl')

	t.true(user.about === 'This is a test')
	t.true(user.id === 'jl')
})

test('maxitem', async t => {
	var news = hackernews()
	const maxItem = await news.maxItem()
	t.true(maxItem > 0, 'returns resultful value')
})

test('updates', async t => {
	var news = hackernews()
	const res = await news.update()

	t.true(res.items.length > 0)
	t.true(res.profiles.length > 0)
})
