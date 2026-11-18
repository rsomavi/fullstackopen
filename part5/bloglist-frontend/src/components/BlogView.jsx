import { Paper, Typography, Button, Link as MuiLink, Box } from '@mui/material'

const BlogView = ({ blog, user, likeBlog, removeBlog }) => {
  if (!blog) {
    return null
  }

  const isCreator = Boolean(
    user && blog.user && blog.user.username === user.username
  )

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        {blog.title} {blog.author}
      </Typography>
      <Typography gutterBottom>
        <MuiLink href={blog.url} target="_blank" rel="noreferrer">
          {blog.url}
        </MuiLink>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography>likes {blog.likes}</Typography>
        {user && (
          <Button variant="outlined" size="small" onClick={() => likeBlog(blog)}>
            like
          </Button>
        )}
      </Box>
      <Typography color="text.secondary" gutterBottom>
        added by {blog.user ? blog.user.name : 'unknown'}
      </Typography>
      {isCreator && (
        <Button color="error" variant="contained" onClick={() => removeBlog(blog)}>
          remove
        </Button>
      )}
    </Paper>
  )
}

export default BlogView