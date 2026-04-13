export function tg() {
    return window.Telegram?.WebApp
}

function setCssVar(name, valuePx) {
    document.documentElement.style.setProperty(
        name,
        `${Math.max(0, Math.round(valuePx || 0))}px`
    )
}

function applyTelegramInsetsAndFlags() {
    const webApp = tg()
    const html = document.documentElement

    if (!webApp) {
        html.removeAttribute('data-tg')
        setCssVar('--tg-top', 0)
        setCssVar('--tg-bottom', 0)
        return
    }

    html.setAttribute('data-tg', '1')

    const safe = webApp.safeAreaInset || {}
    const content = webApp.contentSafeAreaInset || {}

    // На iPhone иногда 0, но сверху кнопки есть → фолбэк 56px
    const top = Math.max(safe.top || 0, content.top || 0, 56)
    const bottom = Math.max(safe.bottom || 0, content.bottom || 0)

    setCssVar('--tg-top', top)
    setCssVar('--tg-bottom', bottom)
}

function aggressiveExpand(webApp) {
    // iOS часто не expand с первого раза
    const start = Date.now()
    const id = setInterval(() => {
            try {
                webApp.expand()
            } catch (_) {}

            if (webApp.isExpanded) clearInterval(id)
            if (Date.now() - start > 2500) clearInterval(id)
        }, 120)

    ;[150, 350, 700, 1200].forEach((ms) => {
        setTimeout(() => {
            try {
                webApp.expand()
            } catch (_) {}
        }, ms)
    })
}

export function initTelegram() {
    const webApp = tg()
    applyTelegramInsetsAndFlags()
    if (!webApp) return

    webApp.ready()

    // Максимально развернуть
    aggressiveExpand(webApp)

    // Не обязательно, но можно сделать цвета, чтобы выглядело красивее
    webApp.setHeaderColor?.('#e3eeff')
    webApp.setBackgroundColor?.('#e3eeff')
    webApp.setBottomBarColor?.('#ffffff')

    // На старых версиях Telegram может быть warning — это не критично
    webApp.disableVerticalSwipes?.()

    webApp.onEvent?.('viewportChanged', () => {
        aggressiveExpand(webApp)
        applyTelegramInsetsAndFlags()
    })
    webApp.onEvent?.('safeAreaChanged', applyTelegramInsetsAndFlags)
    webApp.onEvent?.('contentSafeAreaChanged', applyTelegramInsetsAndFlags)
}