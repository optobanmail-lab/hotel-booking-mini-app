import { AppBar, Box, BottomNavigation, BottomNavigationAction, Container, Paper, Toolbar, Typography } from '@mui/material'
import HotelIcon from '@mui/icons-material/Hotel'
import BookmarksIcon from '@mui/icons-material/Bookmarks'
import PersonIcon from '@mui/icons-material/Person'
import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
    { label: 'Отели', icon: <HotelIcon />, path: '/catalog' },
    { label: 'Брони', icon: <BookmarksIcon />, path: '/bookings' },
    { label: 'Профиль', icon: <PersonIcon />, path: '/profile' },
]

export default function AppShell({ title, children }) {
    const location = useLocation()
    const navigate = useNavigate()

    const currentIndex = Math.max(0, tabs.findIndex(t => location.pathname.startsWith(t.path)))

    return (
        <Box sx={{ minHeight: '100vh', pb: 9 }}>
            <AppBar position="sticky" color="transparent" elevation={0}
                    sx={{ backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Toolbar>
                    <Typography variant="h6">{title}</Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="sm" sx={{ pt: 2 }}>
                {children}
            </Container>

            <Paper
                elevation={8}
                sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
            >
                <BottomNavigation
                    showLabels
                    value={currentIndex}
                    onChange={(_, idx) => navigate(tabs[idx].path)}
                >
                    {tabs.map(t => (
                        <BottomNavigationAction key={t.path} label={t.label} icon={t.icon} />
                    ))}
                </BottomNavigation>
            </Paper>
        </Box>
    )
}