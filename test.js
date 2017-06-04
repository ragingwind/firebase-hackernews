import test from 'ava'
import hackernews from './'

test('top', async t => {
	const res = await hackernews().stories('top')
	t.true(res.length > 0, 'returns resultful value')
})

test('stories', async t => {
	await Promise.all(['top', 'new', 'best', 'ask', 'show', 'job'].map(type => {
		return new Promise(async resolve => {
			const res = await hackernews().stories(type)
			t.true(res.length > 0, 'returns resultful value')
			resolve()
		})
	}))
})

test('count of default', async t => {
	await Promise.all(['top', 'new', 'best', 'ask', 'show', 'job'].map(type => {
		return new Promise(async resolve => {
			const res = await hackernews().stories(type, {
				page: 1
			})
			t.true(res.length > 0, 'returns resultful value')
			resolve()
		})
	}))
})

test('count of custom', async t => {
	await Promise.all(['top', 'new', 'best', 'ask', 'show', 'job'].map(type => {
		return new Promise(async resolve => {
			const res = await hackernews().stories(type, {
				page: 1,
				count: 10
			})
			t.true(res.length === 10, 'returns resultful value')
			resolve()
		})
	}))
})

test('user', async t => {
	const user = await hackernews().user('jl')

	t.true(user.about === 'This is a test')
	t.true(user.id === 'jl')
})

test('maxitem', async t => {
	const maxItem = await hackernews().maxItem()
	t.true(maxItem > 0, 'returns resultful value')
})

test('updates', async t => {
	const res = await hackernews().update()

	t.true(res.items.length > 0)
	t.true(res.profiles.length > 0)
})

test('length', async t => {
	await hackernews().stories('top')
	const length = await hackernews().length('top')

	t.true(length > 0)
})

test('total length', async t => {
	await hackernews().stories('top')
	const length = await hackernews().length('top')

	t.true(length === 500)
})

test('kids', async t => {
	const res = await hackernews().stories('top')
	await hackernews().kids(res[1].id)

	res[1].kids.forEach(id => {
		t.true(hackernews().cached(id).id !== undefined)
	})
})

test('sync apis', async t => {
	const res = await hackernews().stories('top')
	const stories = hackernews().storiesSync('top')

	t.deepEqual(res, stories)
})
