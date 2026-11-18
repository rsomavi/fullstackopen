import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App'

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </Router>
)