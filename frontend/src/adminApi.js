import axios from 'axios'

export const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE ?? '',
})

export function getAdminToken() {
    return localStorage.getItem('admin_token') || ''
}
export function setAdminToken(token) {
    localStorage.setItem('admin_token', token)
}
export function clearAdminToken() {
    localStorage.removeItem('admin_token')
}

adminApi.interceptors.request.use((config) => {
    const token = getAdminToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export async function adminLogin(password) {
    const res = await adminApi.post('/api/admin/login', { password })
    setAdminToken(res.data.token)
    return res.data.token
}

export async function adminHotels() {
    const res = await adminApi.get('/api/admin/hotels')
    return res.data
}

export async function adminGetHotel(id) {
    const res = await adminApi.get(`/api/admin/hotels/${id}`)
    return res.data
}

export async function adminCreateHotel(payload) {
    const res = await adminApi.post('/api/admin/hotels', payload)
    return res.data
}

export async function adminDeleteHotel(id) {
    const res = await adminApi.delete(`/api/admin/hotels/${id}`)
    return res.data
}

export async function adminAddRoom(hotelId, payload) {
    const res = await adminApi.post(`/api/admin/hotels/${hotelId}/rooms`, payload)
    return res.data
}

export async function adminDeleteRoom(roomId) {
    const res = await adminApi.delete(`/api/admin/rooms/${roomId}`)
    return res.data
}

export async function adminRefreshPhotos(hotelId) {
    const res = await adminApi.post(`/api/admin/hotels/${hotelId}/refresh-photos`)
    return res.data
}