const BlogView = ({ blog, user, likeBlog, removeBlog }) => {
  if (!blog) {
    return null
  }

  const isCreator = Boolean(
    user && blog.user && blog.user.username === user.username
  )

  return (
    <div>
      <h2>{blog.title} {blog.author}</h2>
      <div>{blog.url}</div>
      <div>
        likes {blog.likes}
        {user && <button onClick={() => likeBlog(blog)}>like</button>}
      </div>
      <div>added by {blog.user ? blog.user.name : 'unknown'}</div>
      {isCreator && <button onClick={() => removeBlog(blog)}>remove</button>}
    </div>
  )
}

export default BlogView