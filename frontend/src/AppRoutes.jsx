import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'

import LitePage from './pages/LitePage'

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
                {/* СТАБИЛЬНАЯ ГЛАВНАЯ */}
                <Route path="/" element={<LitePage />} />
                <Route path="/home" element={<LitePage />} />

                {/* ТЕСТОВЫЕ РОУТЫ: открываем по одному */}
                <Route path="/test/home" element={<HomeNewsPage />} />
                <Route path="/test/catalog" element={<CatalogPage />} />
                <Route path="/test/search" element={<SearchPage />} />
                <Route path="/test/hotel/:id" element={<HotelDetailsPage />} />
                <Route path="/test/booking/new" element={<BookingPage />} />
                <Route path="/test/bookings" element={<MyBookingsPage />} />
                <Route path="/test/profile" element={<ProfilePage />} />

                {/* Остальное */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/bookings/:id/confirmed" element={<BookingConfirmedPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    )
}