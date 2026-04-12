import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
})

function tgWebApp() {
    return window.Telegram?.WebApp
}

export function telegramUserId() {
    const id = tgWebApp()?.initDataUnsafe?.user?.id
    if (id) return Number(id)

    // fallback для разработки в обычном браузере
    const dev = localStorage.getItem('tg_id')
    return dev ? Number(dev) : null
}

export function telegramInitData() {
    return tgWebApp()?.initData ?? ''
}

// --- Request interceptor: Telegram headers ---
api.interceptors.request.use((config) => {
    const headers = config.headers ?? {}

    const initData = telegramInitData()
    if (initData) headers['X-Telegram-Init-Data'] = initData

    const uid = telegramUserId()
    if (uid != null) headers['X-Telegram-Id'] = uid

    config.headers = headers
    return config
})

// --- Response interceptor: retry on 502/503/504 (Render cold start) ---
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms))
}

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const config = error.config || {}
        const status = error.response?.status

        // Сколько раз уже ретраили этот запрос
        config.__retryCount = config.__retryCount || 0

        const retryable = !error.response || [502, 503, 504].includes(status)

        // Ретраим до 5 раз с увеличивающейся задержкой
        if (retryable && config.__retryCount < 5) {
            config.__retryCount += 1
            const delay = Math.min(1500 * config.__retryCount, 7000) // 1.5s, 3s, 4.5s, 6s, 7s
            await sleep(delay)
            return api.request(config)
        }

        throw error
    }
)

// --- API functions ---
export async function getHotels(city) {
    const res = await api.get('/api/hotels', { params: { city: city ?? '' } })
    return res.data
}

export async function getHotel(id) {
    const res = await api.get(`/api/hotels/${id}`)
    return res.data
}

export async function createBooking(payload) {
    const res = await api.post('/api/bookings', payload)
    return res.data
}

export async function myBookings() {
    const res = await api.get('/api/bookings/my')
    return res.data
}

export async function cancelBooking(id) {
    const res = await api.post(`/api/bookings/${id}/cancel`, null)
    return res.data
}

export async function getNews(limit = 8) {
    const res = await api.get('/api/news', { params: { limit } })
    return res.data
}