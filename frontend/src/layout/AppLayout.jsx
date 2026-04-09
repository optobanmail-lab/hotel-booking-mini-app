import { Box } from '@mui/material'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomBar from '../components/BottomBar'
import PageTransition from '../components/PageTransition'

export default function AppLayout() {
    const location = useLocation()
    const navType = useNavigationType()
    const direction = navType === 'POP' ? -1 : 1

    const isAdmin = location.pathname.startsWith('/admin')

    return (
        <Box sx={{ minHeight: '100vh', pb: isAdmin ? 0 : 11 }}>
            <AnimatePresence mode="wait" initial={false}>
                <PageTransition key={location.pathname} direction={direction}>
                    <Outlet />
                </PageTransition>
            </AnimatePresence>

            {!isAdmin && <BottomBar />}
        </Box>
    )
}