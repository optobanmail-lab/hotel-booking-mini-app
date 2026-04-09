import axios from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE ?? '',
})

function telegramId() {
    // пока dev, позже заменим на Telegram initData
    return Number(localStorage.getItem('tg_id') || 1)
}

export async function getHotels(city) {
    const res = await api.get('/api/hotels', { params: { city: city ?? '' } })
    return res.data
}

export async function getHotel(id) {
    const res = await api.get(`/api/hotels/${id}`)
    return res.data
}

export async function createBooking(payload) {
    const res = await api.post('/api/bookings', payload, {
        headers: { 'X-Telegram-Id': telegramId() },
    })
    return res.data
}

export async function myBookings() {
    const res = await api.get('/api/bookings/my', {
        headers: { 'X-Telegram-Id': telegramId() },
    })
    return res.data
}

export async function cancelBooking(id) {
    const res = await api.post(`/api/bookings/${id}/cancel`, null, {
        headers: { 'X-Telegram-Id': telegramId() },
    })
    return res.data
}

export async function getNews(limit = 8) {
    const res = await api.get('/api/news', { params: { limit } })
    return res.data
}