import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import BottomBar from '../components/BottomBar'
import PageTransition from '../components/PageTransition'
import ScrollToTop from '../components/ScrollToTop'

export default function AppLayout() {
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')

    const isTelegram = !!window.Telegram?.WebApp
    const transitionsEnabled = !isTelegram

    return (
        <Box
            className="phone-frame"
            sx={{
                height: '100dvh',
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            <Box
                id="app-scroll"
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    pt: 'calc(var(--tg-top, 0px) + env(safe-area-inset-top) + 8px)',
                    pb: isAdmin
                        ? 'calc(var(--tg-bottom, 0px) + env(safe-area-inset-bottom))'
                        : 'calc(88px + var(--tg-bottom, 0px) + env(safe-area-inset-bottom))',
                }}
            >
                <ScrollToTop />

                <PageTransition enabled={transitionsEnabled} routeKey={location.pathname}>
                    <Outlet />
                </PageTransition>
            </Box>

            {!isAdmin && <BottomBar />}
        </Box>
    )
}