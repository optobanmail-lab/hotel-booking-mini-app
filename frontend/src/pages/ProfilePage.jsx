import {
    Avatar,
    Box,
    Button,
    Container,
    Divider,
    Paper,
    Stack,
    Typography,
} from '@mui/material'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import BookmarksRoundedIcon from '@mui/icons-material/BookmarksRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { useNavigate } from 'react-router-dom'
import { appBg } from '../ui/appBg'

function Row({ title, subtitle, icon, onClick }) {
    return (
        <Button
            onClick={onClick}
            variant="text"
            disableRipple
            endIcon={<ChevronRightRoundedIcon />}
            sx={{
                px: 0,
                py: 1.2,
                justifyContent: 'space-between',
                textTransform: 'none',
                borderRadius: 2,
                color: 'text.primary',
                '&:hover': { bgcolor: 'rgba(16,24,40,0.04)' },
            }}
            fullWidth
        >
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ textAlign: 'left' }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(21,94,239,0.12)',
                        color: '#155EEF',
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 950, lineHeight: 1.2 }}>{title}</Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Button>
    )
}

export default function ProfilePage() {
    const navigate = useNavigate()

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
                {/* Верхняя карточка профиля */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.88)',
                        borderColor: 'rgba(16,24,40,0.10)',
                        backdropFilter: 'blur(12px)',
                        mb: 1.5,
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: 'rgba(21,94,239,0.14)',
                                color: '#155EEF',
                                fontWeight: 950,
                            }}
                        >
                            U
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 950, letterSpacing: -0.2, lineHeight: 1.1 }}>
                                Профиль
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Настройки и доступ к разделам приложения
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {/* Быстрые действия */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.92)',
                        borderColor: 'rgba(16,24,40,0.10)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <Typography sx={{ fontWeight: 950, mb: 1 }}>Разделы</Typography>

                    <Row
                        title="Мои бронирования"
                        subtitle="История и управление бронированиями"
                        icon={<BookmarksRoundedIcon />}
                        onClick={() => navigate('/bookings')}
                    />

                    <Divider sx={{ my: 1, borderColor: 'rgba(16,24,40,0.08)' }} />

                    <Typography sx={{ fontWeight: 950, mb: 1 }}>Админ</Typography>

                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: 'rgba(245,158,11,0.16)',
                                    color: '#92400E',
                                    flexShrink: 0,
                                }}
                            >
                                <ShieldRoundedIcon />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 950, lineHeight: 1.2 }}>Admin Dashboard</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                    Управление контентом и бронированиями
                                </Typography>
                            </Box>
                        </Stack>

                        <Button
                            variant="contained"
                            sx={{ borderRadius: 999, fontWeight: 950, py: 1.1 }}
                            onClick={() => navigate('/admin')}
                        >
                            Открыть админку
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    )
}