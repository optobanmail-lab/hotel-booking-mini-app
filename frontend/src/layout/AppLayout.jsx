import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import BottomBar from '../components/BottomBar'

export default function AppLayout() {
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')

    return (
        <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, pb: isAdmin ? 0 : 11, overflowX: 'hidden' }}>
                <Outlet />
            </Box>
            {!isAdmin && <BottomBar />}
        </Box>
    )
}