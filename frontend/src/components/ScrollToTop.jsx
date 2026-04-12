import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop({ selector = '#app-scroll' }) {
    const { pathname, search } = useLocation()

    useEffect(() => {
        const el = document.querySelector(selector)
        if (!el) {
            window.scrollTo(0, 0)
            return
        }

        // делаем после рендера страницы/анимации
        requestAnimationFrame(() => {
            el.scrollTop = 0
        })
    }, [pathname, search, selector])

    return null
}