import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import BottomBar from '../components/BottomBar'
import PageTransition from '../components/PageTransition'

export default function AppLayout() {
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')

    const isTelegram = !!window.Telegram?.WebApp
    const transitionsEnabled = !isTelegram

    return (
        <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, pb: isAdmin ? 0 : 11, overflowX: 'hidden' }}>
                <PageTransition enabled={transitionsEnabled} routeKey={location.pathname}>
                    <Outlet />
                </PageTransition>
            </Box>

            {!isAdmin && <BottomBar />}
        </Box>
    )
}