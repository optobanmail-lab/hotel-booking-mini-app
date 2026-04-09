import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from './theme'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </BrowserRouter>
)