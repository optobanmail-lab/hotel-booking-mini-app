import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from './theme'
import App from './App.jsx'
import { initTelegram } from './telegram'
import './App.css'

const rootEl = document.getElementById('root')

function showFatal(err) {
    if (!rootEl) return
    const msg =
        err && (err.stack || err.message)
            ? (err.stack || err.message)
            : String(err)

    // Безопасно: не innerHTML, а textContent
    rootEl.innerHTML = ''
    const pre = document.createElement('pre')
    pre.style.whiteSpace = 'pre-wrap'
    pre.style.padding = '12px'
    pre.style.font = '14px/1.4 monospace'
    pre.style.background = '#000'
    pre.style.color = '#fff'
    pre.textContent = msg
    rootEl.appendChild(pre)
}

window.addEventListener('error', (e) => showFatal(e.error || e.message))
window.addEventListener('unhandledrejection', (e) => showFatal(e.reason))

initTelegram()

ReactDOM.createRoot(rootEl).render(
    <BrowserRouter>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </BrowserRouter>
)