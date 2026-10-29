const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  { title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com/', likes: 7 },
  { title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf', likes: 5 },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', url: 'http://example.com/x' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}


const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

module.exports = { initialBlogs, blogsInDb, nonExistingId, usersInDb }
