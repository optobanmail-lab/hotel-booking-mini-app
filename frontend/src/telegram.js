export function tg() {
    return window.Telegram?.WebApp
}

function setCssVar(name, valuePx) {
    document.documentElement.style.setProperty(
        name,
        `${Math.max(0, Math.round(valuePx || 0))}px`
    )
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
    applyTelegramInsets()
    if (!webApp) return

    webApp.ready()

    // iOS: expand иногда срабатывает не сразу — делаем несколько попыток
    const start = Date.now()
    const id = setInterval(() => {
        webApp.expand()
        if (webApp.isExpanded) clearInterval(id)
        if (Date.now() - start > 2500) clearInterval(id)
    }, 150)

    // Не критично: на старых версиях Telegram будет warning
    webApp.disableVerticalSwipes?.()

    webApp.onEvent?.('viewportChanged', () => {
        webApp.expand()
        applyTelegramInsets()
    })
    webApp.onEvent?.('safeAreaChanged', applyTelegramInsets)
    webApp.onEvent?.('contentSafeAreaChanged', applyTelegramInsets)
}