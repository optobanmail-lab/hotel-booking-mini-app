import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomBar from '../components/BottomBar'
import PageTransition from '../components/PageTransition'

export default function AppLayout() {
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Важно: overflowX hidden, чтобы не было микродёрганий/скроллбара от transform */}
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