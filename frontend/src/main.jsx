import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from './theme'
import App from './App.jsx'
import { initTelegram } from './telegram'
import './App.css'

const rootEl = document.getElementById('root')

function showFatal(err) {
    const msg = (err && (err.stack || err.message)) ? (err.stack || err.message) : String(err)
    rootEl.innerHTML = `
    <pre style="white-space:pre-wrap; padding:12px; font:14px/1.4 monospace; background:#000; color:#fff;">
${msg}
    </pre>
  `
}

window.addEventListener('error', (e) => showFatal(e.error || e.message))
window.addEventListener('unhandledrejection', (e) => showFatal(e.reason))

initTelegram()

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </BrowserRouter>
)