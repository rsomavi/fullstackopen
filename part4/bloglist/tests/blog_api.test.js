const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = await new User({ username: 'root', passwordHash }).save()

  await Blog.insertMany(helper.initialBlogs.map((b) => ({ ...b, user: user._id })))

  const login = await api.post('/api/login').send({ username: 'root', password: 'sekret' })
  token = login.body.token
})

describe('when there are blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })
})

describe('adding a blog', () => {
  const newBlog = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://example.com/ewd808',
    likes: 12,
  }

  test('succeeds with a valid token', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    assert(blogsAtEnd.map((b) => b.title).includes(newBlog.title))
  })

  test('fails with 401 if token is not provided', async () => {
    await api.post('/api/blogs').send(newBlog).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('likes defaults to 0 when missing', async () => {
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No likes', author: 'Someone', url: 'http://example.com/nl' })
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('blog without title is rejected', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ author: 'Someone', url: 'http://example.com/nt' })
      .expect(400)
  })

  test('blog without url is rejected', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No url', author: 'Someone' })
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with 204 for the creator', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    assert(!blogsAtEnd.map((b) => b.id).includes(blogToDelete.id))
  })

  test('fails with 401 without a token', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api.delete(`/api/blogs/${blogsAtStart[0].id}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with 403 for a user who is not the creator', async () => {
    const passwordHash = await bcrypt.hash('other', 10)
    await new User({ username: 'other', passwordHash }).save()
    const login = await api.post('/api/login').send({ username: 'other', password: 'other' })

    const blogsAtStart = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${blogsAtStart[0].id}`)
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(403)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with 400 if id is malformatted', async () => {
    await api
      .delete('/api/blogs/notAValidId')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('updating a blog', () => {
  test('succeeds in updating the likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...blogToUpdate, likes: blogToUpdate.likes + 10 })
      .expect(200)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
  })

  test('fails with 404 if blog does not exist', async () => {
    const id = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${id}`)
      .send({ title: 'x', author: 'y', url: 'http://example.com', likes: 1 })
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})