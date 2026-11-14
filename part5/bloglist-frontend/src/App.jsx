import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useMatch, useNavigate } from 'react-router-dom'
import BlogList from './components/BlogList'
import BlogView from './components/BlogView'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Menu from './components/Menu'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const STORAGE_KEY = 'loggedBloglistUser'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(() => {
    const loggedUserJSON = window.localStorage.getItem(STORAGE_KEY)
    return loggedUserJSON ? JSON.parse(loggedUserJSON) : null
  })
  const [notification, setNotification] = useState(null)

  const navigate = useNavigate()
  const match = useMatch('/blogs/:id')
  const blog = match ? blogs.find((b) => b.id === match.params.id) : null

  useEffect(() => {
    const fetchBlogs = async () => {
      const initialBlogs = await blogService.getAll()
      setBlogs(initialBlogs)
    }
    fetchBlogs()
  }, [])

  useEffect(() => {
    blogService.setToken(user ? user.token : null)
  }, [user])

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const login = async (credentials) => {
    try {
      const loggedUser = await loginService.login(credentials)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser))
      setUser(loggedUser)
      navigate('/')
    } catch {
      showNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    navigate('/')
  }

  const createBlog = async (blogObject) => {
    try {
      const createdBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(createdBlog))
      showNotification(
        `a new blog ${createdBlog.title} by ${createdBlog.author} added`,
        'success'
      )
      navigate('/')
    } catch (error) {
      const message = error.response?.data?.error || 'could not create the blog'
      showNotification(message, 'error')
    }
  }

  const likeBlog = async (blogToLike) => {
    try {
      const updatedBlog = await blogService.update(blogToLike.id, {
        user: blogToLike.user?.id,
        likes: blogToLike.likes + 1,
        author: blogToLike.author,
        title: blogToLike.title,
        url: blogToLike.url,
      })
      setBlogs(blogs.map((b) => (b.id === blogToLike.id ? updatedBlog : b)))
    } catch {
      showNotification('could not update the blog', 'error')
    }
  }

  const removeBlog = async (blogToRemove) => {
    if (!window.confirm(`Remove blog ${blogToRemove.title} by ${blogToRemove.author}?`)) {
      return
    }

    try {
      await blogService.remove(blogToRemove.id)
      setBlogs(blogs.filter((b) => b.id !== blogToRemove.id))
      navigate('/')
    } catch (error) {
      const message = error.response?.data?.error || 'could not remove the blog'
      showNotification(message, 'error')
    }
  }

  return (
    <div>
      <Menu user={user} handleLogout={handleLogout} />
      <Notification notification={notification} />

      <Routes>
        <Route path="/" element={<BlogList blogs={blogs} />} />
        <Route
          path="/blogs/:id"
          element={
            <BlogView
              blog={blog}
              user={user}
              likeBlog={likeBlog}
              removeBlog={removeBlog}
            />
          }
        />
        <Route
          path="/create"
          element={
            user ? <BlogForm createBlog={createBlog} /> : <Navigate replace to="/login" />
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate replace to="/" /> : <LoginForm login={login} />}
        />
      </Routes>
    </div>
  )
}

export default App