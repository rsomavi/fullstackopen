import { useState } from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    createBlog({ title, author, url })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mt: 3 }}
    >
      <Typography variant="h5" component="h2">
        create new
      </Typography>
      <TextField
        label="title"
        value={title}
        onChange={({ target }) => setTitle(target.value)}
      />
      <TextField
        label="author"
        value={author}
        onChange={({ target }) => setAuthor(target.value)}
      />
      <TextField
        label="url"
        value={url}
        onChange={({ target }) => setUrl(target.value)}
      />
      <Button type="submit" variant="contained">
        create
      </Button>
    </Box>
  )
}

export default BlogForm