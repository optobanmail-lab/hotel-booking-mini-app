import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import BottomBar from '../components/BottomBar'
import PageTransition from '../components/PageTransition'
import TelegramFullscreenButton from '../components/TelegramFullscreenButton'

export default function AppLayout() {
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')

    const isTelegram = !!window.Telegram?.WebApp
    const transitionsEnabled = !isTelegram

    return (
        <Box
            sx={{
                minHeight: '100dvh',
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', // важно: body не скроллится
            }}
        >
            {!isAdmin && (
                <Box
                    sx={{
                        position: 'fixed',
                        right: 12,
                        top: 'calc(env(safe-area-inset-top) + 12px)',
                        zIndex: 9999,
                        pointerEvents: 'none',
                    }}
                >
                    <Box sx={{ pointerEvents: 'auto' }}>
                        <TelegramFullscreenButton />
                    </Box>
                </Box>
            )}

            {/* ЕДИНСТВЕННОЕ место, где есть скролл */}
            <Box
                id="app-scroll"
                sx={{
                    flex: 1,
                    minHeight: 0, // важно для flex + overflow
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    pb: isAdmin ? 0 : 11,
                }}
            >
                <PageTransition enabled={transitionsEnabled} routeKey={location.pathname}>
                    <Outlet />
                </PageTransition>
            </Box>

            {!isAdmin && <BottomBar />}
        </Box>
    )
}