const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    await new User({ username: 'root', passwordHash }).save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    await api
      .post('/api/users')
      .send({ username: 'mluukkai', name: 'Matti', password: 'salainen' })
      .expect(201)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  })

  test('creation fails if username is taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const result = await api
      .post('/api/users')
      .send({ username: 'root', name: 'Superuser', password: 'salainen' })
      .expect(400)

    assert(result.body.error.includes('expected `username` to be unique'))
    assert.strictEqual((await helper.usersInDb()).length, usersAtStart.length)
  })

  test('creation fails if username is too short', async () => {
    const result = await api
      .post('/api/users')
      .send({ username: 'ab', name: 'Short', password: 'salainen' })
      .expect(400)

    assert(result.body.error.includes('at least 3 characters'))
  })

  test('creation fails if password is too short', async () => {
    const result = await api
      .post('/api/users')
      .send({ username: 'validname', name: 'Short', password: 'ab' })
      .expect(400)

    assert(result.body.error.includes('at least 3 characters'))
  })

  test('creation fails if password is missing', async () => {
    await api
      .post('/api/users')
      .send({ username: 'nopassword', name: 'None' })
      .expect(400)

    assert.strictEqual((await helper.usersInDb()).length, 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})