const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there are blogs saved', () => {
  test('blogs are returned as json (4.8)', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned (4.8)', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier is named id (4.9)', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach((blog) => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })
})

describe('adding a blog', () => {
  test('a valid blog can be added (4.10)', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((b) => b.title)
    assert(titles.includes('Canonical string reduction'))
  })

  test('likes defaults to 0 when missing (4.11)', async () => {
    const newBlog = {
      title: 'No likes here',
      author: 'Someone',
      url: 'http://example.com/nolikes',
    }

    const response = await api.post('/api/blogs').send(newBlog).expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('blog without title is rejected (4.12)', async () => {
    const newBlog = { author: 'Someone', url: 'http://example.com/notitle', likes: 1 }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('blog without url is rejected (4.12)', async () => {
    const newBlog = { title: 'No url', author: 'Someone', likes: 1 }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid (4.13)', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const ids = blogsAtEnd.map((b) => b.id)
    assert(!ids.includes(blogToDelete.id))
  })

  test('fails with status code 400 if id is malformatted (4.13)', async () => {
    await api.delete('/api/blogs/notAValidId').expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('updating a blog', () => {
  test('succeeds in updating the likes (4.14)', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updated = { ...blogToUpdate, likes: blogToUpdate.likes + 10 }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updated)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)

    const blogsAtEnd = await helper.blogsInDb()
    const inDb = blogsAtEnd.find((b) => b.id === blogToUpdate.id)
    assert.strictEqual(inDb.likes, blogToUpdate.likes + 10)
  })

  test('fails with status code 404 if blog does not exist (4.14)', async () => {
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