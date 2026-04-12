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

    // Фолбэк, если Telegram inset не отдаёт
    if (top === 0) top = 56

    setCssVar('--tg-top', top)
    setCssVar('--tg-bottom', bottom)
}

export function initTelegram() {
    const webApp = tg()
    if (!webApp) {
        // если не Telegram — убираем флаг на всякий случай
        document.documentElement.removeAttribute('data-tg')
        return
    }

    // Флаг "мы внутри Telegram"
    document.documentElement.setAttribute('data-tg', '1')

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