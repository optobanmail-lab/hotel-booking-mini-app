import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'
import AppLayout from './layout/AppLayout'

const LitePage = lazy(() => import('./pages/LitePage.jsx'))

const HomeNewsPage = lazy(() => import('./pages/HomeNewsPage.jsx'))
const CatalogPage = lazy(() => import('./pages/CatalogPage.jsx'))
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'))
const HotelDetailsPage = lazy(() => import('./pages/HotelDetailsPage.jsx'))
const BookingPage = lazy(() => import('./pages/BookingPage.jsx'))
const BookingConfirmedPage = lazy(() => import('./pages/BookingConfirmedPage.jsx'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))

function Loading() {
    return (
        <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
        </Box>
    )
}

/**
 * На время отладки держи true.
 * Когда починишь причину краша — поставишь false и вернёшь HomeNewsPage на "/".
 */
const USE_LITE_HOME = true

export default function AppRoutes() {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                <Route element={<AppLayout />}>
                    {/* Debug routes */}
                    <Route path="/lite" element={<LitePage />} />

                    {/* Домашняя */}
                    <Route path="/" element={USE_LITE_HOME ? <LitePage /> : <HomeNewsPage />} />
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
        </Suspense>
    )
}