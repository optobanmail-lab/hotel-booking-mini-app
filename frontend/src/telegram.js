export function tg() {
    return window.Telegram?.WebApp
}

function setCssVar(name, valuePx) {
    document.documentElement.style.setProperty(
        name,
        `${Math.max(0, Math.round(valuePx || 0))}px`
    )
}

function applyTelegramFlagsAndInsets() {
    const webApp = tg()
    const html = document.documentElement

    if (!webApp) {
        html.removeAttribute('data-tg')
        html.removeAttribute('data-tg-desktop')
        setCssVar('--tg-top', 0)
        setCssVar('--tg-bottom', 0)
        return
    }

    html.setAttribute('data-tg', '1')

    const platform = String(webApp.platform || '').toLowerCase()
    // На ПК обычно "tdesktop"
    if (platform === 'tdesktop' || platform.includes('desktop')) {
        html.setAttribute('data-tg-desktop', '1')
    } else {
        html.removeAttribute('data-tg-desktop')
    }

    const safe = webApp.safeAreaInset || {}
    const content = webApp.contentSafeAreaInset || {}

    const top = Math.max(safe.top || 0, content.top || 0, 56) // место под кнопки
    const bottom = Math.max(safe.bottom || 0, content.bottom || 0)

    setCssVar('--tg-top', top)
    setCssVar('--tg-bottom', bottom)
}

export function initTelegram() {
    const webApp = tg()
    if (!webApp) {
        applyTelegramFlagsAndInsets()
        return
    }

    webApp.ready()
    webApp.expand()
    setTimeout(() => webApp.expand(), 250)

    // На старых версиях будет warning — не критично
    webApp.disableVerticalSwipes?.()

    applyTelegramFlagsAndInsets()

    webApp.onEvent?.('viewportChanged', () => {
        webApp.expand()
        applyTelegramFlagsAndInsets()
    })
    webApp.onEvent?.('safeAreaChanged', applyTelegramFlagsAndInsets)
    webApp.onEvent?.('contentSafeAreaChanged', applyTelegramFlagsAndInsets)
}