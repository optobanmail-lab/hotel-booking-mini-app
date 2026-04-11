import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import BottomBar from '../components/BottomBar'
import PageTransition from '../components/PageTransition'
import TelegramFullscreenButton from '../components/TelegramFullscreenButton'

function isTelegram() {
    return !!window.Telegram?.WebApp
}

function prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

export default function AppLayout() {
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')

    // В Telegram и при reduced motion анимации выключаем (иначе часто ловится “Опаньки”)
    const transitionsEnabled = !isTelegram() && !prefersReducedMotion()

    return (
        <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            {!isAdmin && (
                <Box
                    sx={{
                        position: 'fixed',
                        right: 12,
                        top: 'calc(env(safe-area-inset-top) + 12px)',
                        zIndex: 9999,
                    }}
                >
                    <TelegramFullscreenButton />
                </Box>
            )}

            <Box sx={{ flex: 1, pb: isAdmin ? 0 : 11, overflowX: 'hidden' }}>
                <PageTransition enabled={transitionsEnabled} routeKey={location.pathname}>
                    <Outlet />
                </PageTransition>
            </Box>

            {!isAdmin && <BottomBar />}
        </Box>
    )
}