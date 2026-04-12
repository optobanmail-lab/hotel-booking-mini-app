export function tg() {
    return window.Telegram?.WebApp
}

function disablePullToRefreshIOS(scrollSelector = '#app-scroll') {
    const el = document.querySelector(scrollSelector)
    if (!el) return

    let startY = 0

    el.addEventListener(
        'touchstart',
        (e) => {
            if (!e.touches?.length) return
            startY = e.touches[0].clientY
        },
        { passive: true }
    )

    el.addEventListener(
        'touchmove',
        (e) => {
            if (!e.touches?.length) return

            // если мы в самом верху и тянем вниз — блокируем (чтобы не было "обновления")
            const currentY = e.touches[0].clientY
            const pullingDown = currentY > startY

            if (el.scrollTop <= 0 && pullingDown) {
                e.preventDefault()
            }
        },
        { passive: false } // важно: иначе preventDefault не сработает
    )
}

export function initTelegram() {
    const webApp = tg()
    if (!webApp) return

    webApp.ready()
    webApp.expand()

    webApp.disableVerticalSwipes?.()

    webApp.onEvent?.('viewportChanged', () => {
        webApp.expand()
    })

    // после рендера DOM подключаем iOS фикс
    setTimeout(() => disablePullToRefreshIOS('#app-scroll'), 0)

    // попытка fullscreen (не всегда работает без клика)
    try {
        webApp.requestFullscreen?.()
    } catch (_) {}
}

export function requestTelegramFullscreen() {
    const webApp = tg()
    if (!webApp) return
    webApp.expand()
    try {
        webApp.requestFullscreen?.()
    } catch (_) {}
}