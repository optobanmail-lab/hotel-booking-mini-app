export function tg() {
    return window.Telegram?.WebApp
}

function setCssVar(name, valuePx) {
    document.documentElement.style.setProperty(name, `${Math.max(0, Math.round(valuePx || 0))}px`)
}

function applyTelegramInsets() {
    const webApp = tg()
    if (!webApp) {
        setCssVar('--tg-top', 0)
        setCssVar('--tg-bottom', 0)
        return
    }

    const safe = webApp.safeAreaInset || {}
    const content = webApp.contentSafeAreaInset || {}

    let top = Math.max(safe.top || 0, content.top || 0)
    let bottom = Math.max(safe.bottom || 0, content.bottom || 0)

    // Фолбэк: иногда Telegram не отдаёт inset, но кнопки сверху есть
    if (top === 0) top = 56

    setCssVar('--tg-top', top)
    setCssVar('--tg-bottom', bottom)
}

export function initTelegram() {
    const webApp = tg()
    if (!webApp) return

    webApp.ready()
    webApp.expand()
    webApp.disableVerticalSwipes?.()

    applyTelegramInsets()

    webApp.onEvent?.('viewportChanged', () => {
        webApp.expand()
        applyTelegramInsets()
    })
    webApp.onEvent?.('safeAreaChanged', () => applyTelegramInsets())
    webApp.onEvent?.('contentSafeAreaChanged', () => applyTelegramInsets())
}