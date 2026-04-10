export function tg() {
    return window.Telegram?.WebApp
}

export function initTelegram() {
    const webApp = tg()
    if (!webApp) return

    webApp.ready()

    // развернуть “шторку” на максимум
    webApp.expand()

    // полезно: не давать закрывать свайпом вниз (если поддерживается клиентом)
    webApp.disableVerticalSwipes?.()

    // при изменении viewport пробуем снова expand (на некоторых устройствах)
    webApp.onEvent?.('viewportChanged', () => {
        webApp.expand()
    })
}

/**
 * Настоящий fullscreen (не всегда поддерживается и часто требует клика пользователя)
 */
export function requestTelegramFullscreen() {
    const webApp = tg()
    if (!webApp) return

    if (typeof webApp.requestFullscreen === 'function') {
        webApp.requestFullscreen()
    } else {
        // fallback
        webApp.expand()
    }
}