import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export const api = axios.create({
    baseURL: API_BASE,
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

// Автоматически добавляем заголовки на каждый запрос
api.interceptors.request.use((config) => {
    const headers = config.headers ?? {}

    const initData = telegramInitData()
    if (initData) headers['X-Telegram-Init-Data'] = initData

    const uid = telegramUserId()
    if (uid != null) headers['X-Telegram-Id'] = uid

    config.headers = headers
    return config
})

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