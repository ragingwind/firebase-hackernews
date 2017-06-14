import firebase from 'firebase'
import test from 'ava'
import hackernews from './'

const hnservice = hackernews.init(firebase)

test('watch', t => {
	hnservice.watch().then(() => {
		const data = hnservice.dataCached()
		t.true(data.top.length > 0)
	}).catch(err => {
		t.fail()
	})
})

test('top', async t => {
	const res = await hnservice.stories('top')
	t.true(res.length > 0, 'returns resultful value')
})

test('stories', async t => {
	await Promise.all(['top', 'new', 'best', 'ask', 'show', 'job'].map(type => {
		return new Promise(async resolve => {
			const res = await hnservice.stories(type)
			t.true(res.length > 0, 'returns resultful value')
			resolve()
		})
	}))
})

test('count of default', async t => {
	await Promise.all(['top', 'new', 'best', 'ask', 'show', 'job'].map(type => {
		return new Promise(async resolve => {
			const res = await hnservice.stories(type, {
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
			const res = await hnservice.stories(type, {
				page: 1,
				count: 10
			})
			t.true(res.length === 10, 'returns resultful value')
			resolve()
		})
	}))
})

test('user', async t => {
	const user = await hnservice.user('jl')

	t.true(user.about === 'This is a test')
	t.true(user.id === 'jl')
})

test('maxitem', async t => {
	const maxItem = await hnservice.maxItem()
	t.true(maxItem > 0, 'returns resultful value')
})

test('updates', async t => {
	const res = await hnservice.update()

	t.true(res.items.length > 0)
	t.true(res.profiles.length > 0)
})

test('length', async t => {
	await hnservice.stories('top')
	const length = await hnservice.length('top')

	t.true(length > 0)
})

test('total length', async t => {
	await hnservice.stories('top')
	const length = await hnservice.length('top')

	t.true(length >= 400)
})

test('kids', async t => {
	const res = await hnservice.stories('top')
	await hnservice.kids(res[1].id)

	res[1].kids.forEach(id => {
		t.true(hnservice.itemsCached(id)[0].id !== undefined)
	})
})

test('cached apis', async t => {
	const live = await hnservice.stories('top')
	const cached = hnservice.storiesCached('top')

	t.deepEqual(live, cached)
})

test('fetch totalLength', async t => {
	const data = await hnservice.fetch('/hackernews/top')

	t.true(data.length > 0, 'returns resultful value')
})
