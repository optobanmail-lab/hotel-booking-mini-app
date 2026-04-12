export function tg() {
    return window.Telegram?.WebApp
}

function setCssVar(name, valuePx) {
    document.documentElement.style.setProperty(name, `${Math.max(0, Math.round(valuePx || 0))}px`)
}

function applyTelegramInsets() {
    const webApp = tg()
    if (!webApp) {
        document.documentElement.removeAttribute('data-tg')
        setCssVar('--tg-top', 0)
        setCssVar('--tg-bottom', 0)
        return
    }

    document.documentElement.setAttribute('data-tg', '1')

    const safe = webApp.safeAreaInset || {}
    const content = webApp.contentSafeAreaInset || {}

    const top = Math.max(safe.top || 0, content.top || 0, 56)
    const bottom = Math.max(safe.bottom || 0, content.bottom || 0)

    setCssVar('--tg-top', top)
    setCssVar('--tg-bottom', bottom)
}

export function initTelegram() {
    const webApp = tg()
    if (!webApp) return

    webApp.ready()

    // максимально развернуть
    webApp.expand()

    // иногда помогает, когда Telegram "думает"
    setTimeout(() => webApp.expand(), 250)

    // пробуем настоящий fullscreen (если поддерживается)
    try {
        webApp.requestFullscreen?.()
    } catch (_) {}

    // не критично: на старых версиях будет warning
    webApp.disableVerticalSwipes?.()

    applyTelegramInsets()

    webApp.onEvent?.('viewportChanged', () => {
        webApp.expand()
        applyTelegramInsets()
    })
    webApp.onEvent?.('safeAreaChanged', applyTelegramInsets)
    webApp.onEvent?.('contentSafeAreaChanged', applyTelegramInsets)
}

// если захочешь вернуть кнопку — можно вызвать это по клику
export function requestTelegramFullscreen() {
    const webApp = tg()
    if (!webApp) return
    webApp.expand()
    try {
        webApp.requestFullscreen?.()
    } catch (_) {}
}