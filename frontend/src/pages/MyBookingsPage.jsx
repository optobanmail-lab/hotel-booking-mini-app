import { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import BookmarksRoundedIcon from '@mui/icons-material/BookmarksRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { useNavigate } from 'react-router-dom'
import { appBg } from '../ui/appBg'
import { cancelBooking, myBookings } from '../api'

function fmtDateRu(v) {
    if (!v) return '—'
    // если прилетает "YYYY-MM-DD"
    const d = new Date(String(v))
    if (Number.isNaN(d.getTime())) return String(v)
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

function statusUI(status) {
    const s = String(status ?? '').toLowerCase()
    if (s === 'cancelled' || s === 'canceled') return { label: 'Отменено', color: 'default', sx: { bgcolor: 'rgba(0,0,0,0.06)' } }
    if (s === 'confirmed') return { label: 'Подтверждено', color: 'success', sx: { bgcolor: 'rgba(18,183,106,0.12)', color: '#027A48' } }
    if (s === 'pending' || s === 'created') return { label: 'В обработке', color: 'warning', sx: { bgcolor: 'rgba(245,158,11,0.14)', color: '#92400E' } }
    return { label: status || '—', color: 'default', sx: { bgcolor: 'rgba(0,0,0,0.06)' } }
}

export default function MyBookingsPage() {
    const navigate = useNavigate()

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [cancelId, setCancelId] = useState(null)

    async function load() {
        setLoading(true)
        try {
            const data = await myBookings()
            setItems(Array.isArray(data) ? data : [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const content = useMemo(() => {
        if (loading) {
            return (
                <Stack spacing={1.5}>
                    {[1, 2, 3].map((k) => (
                        <Paper
                            key={k}
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.9)',
                                borderColor: 'rgba(16,24,40,0.10)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <Skeleton variant="text" width="55%" height={26} />
                            <Skeleton variant="text" width="80%" />
                            <Skeleton variant="text" width="40%" />
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: 999 }} />
                                <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: 999 }} />
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )
        }

        if (!items.length) {
            return (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        borderColor: 'rgba(16,24,40,0.10)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Stack spacing={1} alignItems="flex-start">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 2,
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: 'rgba(21,94,239,0.12)',
                                    color: '#155EEF',
                                }}
                            >
                                <BookmarksRoundedIcon />
                            </Box>
                            <Box>
                                <Typography fontWeight={950}>Пока нет бронирований</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Найди отель и оформи первое бронирование.
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={<SearchRoundedIcon />}
                                sx={{ borderRadius: 999, fontWeight: 900 }}
                                onClick={() => navigate('/search')}
                            >
                                Поиск
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{ borderRadius: 999, fontWeight: 900 }}
                                onClick={() => navigate('/catalog')}
                            >
                                Каталог
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            )
        }

        return (
            <Stack spacing={1.5}>
                {items.map((b) => {
                    const st = statusUI(b.status)
                    const disabled = st.label === 'Отменено' || cancelId === b.id

                    return (
                        <Paper
                            key={b.id}
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.92)',
                                borderColor: 'rgba(16,24,40,0.10)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 14px 30px rgba(16,24,40,0.10)',
                            }}
                        >
                            <Stack spacing={1.1}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                    <Typography fontWeight={950} sx={{ letterSpacing: -0.2 }}>
                                        Бронь #{b.id}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={st.label}
                                        sx={{
                                            height: 24,
                                            fontWeight: 900,
                                            borderRadius: 999,
                                            ...st.sx,
                                        }}
                                    />
                                </Stack>

                                <Divider sx={{ borderColor: 'rgba(16,24,40,0.08)' }} />

                                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                                    <Box sx={{ color: 'text.secondary', mt: '2px' }}>
                                        <EventRoundedIcon fontSize="small" />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Даты
                                        </Typography>
                                        <Typography sx={{ fontWeight: 900 }}>
                                            {fmtDateRu(b.check_in)} → {fmtDateRu(b.check_out)}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                                    <Box sx={{ color: 'text.secondary', mt: '2px' }}>
                                        <PaymentsRoundedIcon fontSize="small" />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Сумма
                                        </Typography>
                                        <Typography sx={{ fontWeight: 950 }}>
                                            {Number(b.total_price_kzt ?? 0).toLocaleString('ru-RU')} ₸
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" spacing={1} sx={{ pt: 0.5 }} alignItems="center">
                                    <Button
                                        variant="outlined"
                                        sx={{ borderRadius: 999, fontWeight: 900 }}
                                        onClick={() => navigate('/catalog')}
                                    >
                                        Найти ещё
                                    </Button>

                                    <Box sx={{ flex: 1 }} />

                                    <Button
                                        color="error"
                                        variant="contained"
                                        disabled={disabled}
                                        sx={{ borderRadius: 999, fontWeight: 950 }}
                                        onClick={async () => {
                                            const ok = window.confirm('Отменить бронирование?')
                                            if (!ok) return
                                            try {
                                                setCancelId(b.id)
                                                await cancelBooking(b.id)
                                                await load()
                                            } catch (e) {
                                                alert('Не удалось отменить бронирование')
                                            } finally {
                                                setCancelId(null)
                                            }
                                        }}
                                    >
                                        {cancelId === b.id ? 'Отмена…' : 'Отменить'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    )
                })}
            </Stack>
        )
    }, [items, loading, cancelId, navigate])

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.86)',
                        borderColor: 'rgba(16,24,40,0.10)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 950, letterSpacing: -0.2 }}>
                        Мои бронирования
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управляй датами, статусами и отменой брони.
                    </Typography>
                </Paper>

                {content}
            </Container>
        </Box>
    )
}