import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    InputBase,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'

import { appBg } from '../ui/appBg'
import { getHotels } from '../api'
import HotelCardBookingLike from '../components/HotelCardBookingLike'

const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Атырау']

function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export default function CatalogPage() {
    const navigate = useNavigate()
    const [city, setCity] = useState('')
    const [hotels, setHotels] = useState([])
    const [loading, setLoading] = useState(false)

    async function load(v) {
        const c = (v ?? city).trim()
        setLoading(true)
        try {
            const list = await getHotels(c)
            // перемешиваем базовый список, чтобы любые дальнейшие выборки были "живые"
            setHotels(shuffle(list))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load('')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Вариант B: случайные 5 из ТОП-20 по рейтингу
    const curated = useMemo(() => {
        const top = [...hotels]
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            .slice(0, 20)

        return shuffle(top).slice(0, 5)
    }, [hotels])

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Box sx={{ px: 2, pt: 2, maxWidth: 520, mx: 'auto' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(16,24,40,0.10)' }}>
                        <MenuRoundedIcon />
                    </IconButton>
                    <Typography fontWeight={950}>Hotel Booking</Typography>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>U</Avatar>
                </Stack>

                <Paper
                    variant="outlined"
                    sx={{
                        borderRadius: 999,
                        px: 1,
                        py: 0.6,
                        bgcolor: '#fff',
                        borderColor: 'rgba(16,24,40,0.10)',
                        mb: 1.5,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <SearchRoundedIcon sx={{ color: 'text.secondary', ml: 0.5 }} />
                        <InputBase
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Поиск города (например: Атыр)"
                            sx={{ flex: 1, fontWeight: 900 }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') navigate(`/search?city=${encodeURIComponent(city.trim())}`)
                            }}
                        />
                        <IconButton
                            onClick={() => navigate(`/search?city=${encodeURIComponent(city.trim())}`)}
                            sx={{ bgcolor: 'primary.main', color: '#fff' }}
                        >
                            <TuneRoundedIcon />
                        </IconButton>
                    </Stack>
                </Paper>

                <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 0.5 }}>
                    {CITIES.map((c) => (
                        <Chip
                            key={c}
                            label={c}
                            clickable
                            onClick={() => navigate(`/search?city=${encodeURIComponent(c)}`)}
                            sx={{ bgcolor: '#fff' }}
                        />
                    ))}
                    <Chip label="Все" clickable onClick={() => navigate('/search')} sx={{ bgcolor: '#fff' }} />
                </Stack>

                <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Box>
                        <Typography sx={{ fontSize: 12, letterSpacing: 1, fontWeight: 950, color: 'primary.main' }}>
                            CURATED STAYS
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.4, lineHeight: 1.05 }}>
                            Лучшие варианты
                        </Typography>
                    </Box>

                    <Button variant="outlined" sx={{ borderRadius: 999 }} onClick={() => navigate('/search')}>
                        Показать все
                    </Button>
                </Stack>

                <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {loading && (
                        <>
                            <Skeleton variant="rounded" height={190} />
                            <Skeleton variant="rounded" height={190} />
                            <Skeleton variant="rounded" height={190} />
                        </>
                    )}

                    {!loading &&
                        curated.map((h) => (
                            <HotelCardBookingLike key={h.id} h={h} onClick={() => navigate(`/hotels/${h.id}`)} />
                        ))}
                </Stack>
            </Box>
        </Box>
    )
}