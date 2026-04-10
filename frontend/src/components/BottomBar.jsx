import { Paper, Box, ButtonBase, Portal } from '@mui/material'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import { useLocation, useNavigate } from 'react-router-dom'

const barSx = {
    position: 'fixed',
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 999,
    overflow: 'hidden',
    border: '1px solid rgba(16,24,40,0.10)',
    boxShadow: '0 16px 40px rgba(16,24,40,0.18)',
    bgcolor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    zIndex: 1300,
}

function NavIcon({ selected, children }) {
    return (
        <Box
            sx={{
                width: 42,
                height: 42,
                borderRadius: 999,
                display: 'grid',
                placeItems: 'center',
                bgcolor: selected ? 'primary.main' : 'transparent',
                color: selected ? '#fff' : 'rgba(16,24,40,0.55)',
                transition: 'background-color .18s ease, color .18s ease',
            }}
        >
            {children}
        </Box>
    )
}

export default function BottomBar() {
    const location = useLocation()
    const navigate = useNavigate()

    const tabs = [
        { path: '/home', icon: (sel) => <NavIcon selected={sel}><HomeRoundedIcon /></NavIcon> },
        { path: '/search', icon: (sel) => <NavIcon selected={sel}><SearchRoundedIcon /></NavIcon> },
        { path: '/bookings', icon: (sel) => <NavIcon selected={sel}><BookmarkRoundedIcon /></NavIcon> },
        { path: '/profile', icon: (sel) => <NavIcon selected={sel}><PersonRoundedIcon /></NavIcon> },
    ]

    const pathname = location.pathname
    const value =
        pathname.startsWith('/search') ? 1
            : pathname.startsWith('/bookings') ? 2
                : pathname.startsWith('/profile') ? 3
                    : 0

    return (
        <Portal>
            <Paper elevation={0} sx={barSx}>
                <Box sx={{ display: 'flex', height: 64, bgcolor: 'transparent' }}>
                    {tabs.map((t, i) => {
                        const selected = i === value

                        return (
                            <ButtonBase
                                key={t.path}
                                onClick={() => navigate(t.path)}
                                disableRipple
                                sx={{
                                    flex: 1,
                                    height: '100%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    // фиксируем отсутствие каких-либо “подпрыгиваний”
                                    padding: 0,
                                }}
                            >
                                {t.icon(selected)}
                            </ButtonBase>
                        )
                    })}
                </Box>
            </Paper>
        </Portal>
    )
}