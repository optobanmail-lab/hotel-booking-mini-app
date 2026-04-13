import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from './theme'
import App from './App.jsx'
import { initTelegram } from './telegram'
import './App.css'

const rootEl = document.getElementById('root')

// (опционально) чтобы браузер не восстанавливал скролл сам
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

initTelegram()

ReactDOM.createRoot(rootEl).render(
    <BrowserRouter>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </BrowserRouter>
)