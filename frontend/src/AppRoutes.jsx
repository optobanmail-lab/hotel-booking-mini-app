import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'

import HomeNewsPage from './pages/HomeNewsPage'
import CatalogPage from './pages/CatalogPage'
import SearchPage from './pages/SearchPage'
import HotelDetailsPage from './pages/HotelDetailsPage'
import BookingPage from './pages/BookingPage'
import BookingConfirmedPage from './pages/BookingConfirmedPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                {/* Домашняя */}
                <Route path="/" element={<HomeNewsPage />} />
                <Route path="/home" element={<HomeNewsPage />} />

                {/* Отели */}
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/hotels/:id" element={<HotelDetailsPage />} />

                {/* Бронирования */}
                <Route path="/booking/new" element={<BookingPage />} />
                <Route path="/bookings/:id/confirmed" element={<BookingConfirmedPage />} />
                <Route path="/bookings" element={<MyBookingsPage />} />

                {/* Профиль/админ */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />

                {/* Всё неизвестное -> / */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    )
}