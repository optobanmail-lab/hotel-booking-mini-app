export function tg() {
    return window.Telegram?.WebApp
}

export function initTelegram() {
    const webApp = tg()
    if (!webApp) return

    // Сообщаем Telegram, что приложение готово
    webApp.ready()

    // Максимально развернуть "плашку"
    webApp.expand()

    // Запретить сворачивание свайпом вниз (работает не везде)
    webApp.disableVerticalSwipes?.()

    // Если Telegram меняет viewport — пробуем снова expand
    webApp.onEvent?.('viewportChanged', () => {
        webApp.expand()
    })

    // Попытка true fullscreen (не всегда поддерживается и может игнорироваться без клика)
    try {
        webApp.requestFullscreen?.()
    } catch (_) {
        // игнор
    }
}

export function requestTelegramFullscreen() {
    const webApp = tg()
    if (!webApp) return

    webApp.expand()

    if (typeof webApp.requestFullscreen === 'function') {
        try {
            webApp.requestFullscreen()
        } catch (_) {
            // ignore
        }
    }
}