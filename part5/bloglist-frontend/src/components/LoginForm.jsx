import { useState } from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'

const LoginForm = ({ login }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    login({ username, password })
    setPassword('')
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mt: 3 }}
    >
      <Typography variant="h5" component="h2">
        Log in to application
      </Typography>
      <TextField
        label="username"
        value={username}
        onChange={({ target }) => setUsername(target.value)}
      />
      <TextField
        label="password"
        type="password"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />
      <Button type="submit" variant="contained">
        login
      </Button>
    </Box>
  )
}

export default LoginForm