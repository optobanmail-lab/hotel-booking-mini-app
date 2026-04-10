import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomBar from '../components/BottomBar'
import PageTransition from '../components/PageTransition'
import TelegramFullscreenButton from '../components/TelegramFullscreenButton'

export default function AppLayout() {
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')

    return (
        <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            {/* Кнопка поверх интерфейса (лучше скрыть в админке) */}
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

            {/* Контент */}
            <Box sx={{ flex: 1, pb: isAdmin ? 0 : 11, overflowX: 'hidden' }}>
                <AnimatePresence mode="sync" initial={false}>
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </AnimatePresence>
            </Box>

            {!isAdmin && <BottomBar />}
        </Box>
    )
}