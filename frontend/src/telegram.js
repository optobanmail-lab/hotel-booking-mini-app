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

    // На iOS иногда 0, но кнопки сверху есть → даём фолбэк
    const top = Math.max(safe.top || 0, content.top || 0, 56)
    const bottom = Math.max(safe.bottom || 0, content.bottom || 0)

    setCssVar('--tg-top', top)
    setCssVar('--tg-bottom', bottom)
}

function aggressiveExpand(webApp) {
    // На iOS expand часто срабатывает не сразу — делаем несколько попыток
    const start = Date.now()
    const id = setInterval(() => {
            try {
                webApp.expand()
            } catch (_) {}

            if (webApp.isExpanded) {
                clearInterval(id)
                return
            }

            if (Date.now() - start > 3500) {
                clearInterval(id)
            }
        }, 120)

        // Плюс “контрольные” expand через таймауты
    ;[100, 250, 600, 1200, 2000].forEach((ms) => {
        setTimeout(() => {
            try {
                webApp.expand()
            } catch (_) {}
        }, ms)
    })
}

export function initTelegram() {
    const webApp = tg()
    applyTelegramInsets()
    if (!webApp) return

    webApp.ready()

    // Максимально разворачиваем
    aggressiveExpand(webApp)

    // На старых версиях будет warning — это ок
    webApp.disableVerticalSwipes?.()

    // При любых изменениях viewport снова expand + insets
    webApp.onEvent?.('viewportChanged', () => {
        aggressiveExpand(webApp)
        applyTelegramInsets()
    })
    webApp.onEvent?.('safeAreaChanged', applyTelegramInsets)
    webApp.onEvent?.('contentSafeAreaChanged', applyTelegramInsets)
}