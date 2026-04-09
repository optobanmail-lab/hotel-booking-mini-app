import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Box,
    Button,
    Chip,
    Drawer,
    IconButton,
    InputBase,
    Paper,
    Slider,
    Stack,
    Typography,
    Skeleton,
} from '@mui/material'

import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'

import { appBg } from '../ui/appBg'
import { getHotels } from '../api'
import HotelCardBookingLike from '../components/HotelCardBookingLike'

const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Атырау']

export default function SearchPage() {
    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()

    const initialCity = params.get('city') ?? ''
    const [city, setCity] = useState(initialCity)

    const [hotels, setHotels] = useState([])
    const [loading, setLoading] = useState(false)

    // filters
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [minRating, setMinRating] = useState(0)
    const [maxPrice, setMaxPrice] = useState(9999999)

    async function load(cityValue) {
        const c = (cityValue ?? city).trim()
        setLoading(true)
        try {
            const data = await getHotels(c) // backend поддерживает city="" -> все
            setHotels(data)

            // подстроим maxPrice под данные, если есть
            if (data.length) {
                const max = Math.max(...data.map(x => x.price_from_kzt ?? 0))
                setMaxPrice(max || 9999999)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load(initialCity)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const maxFromData = useMemo(() => {
        const m = Math.max(10000, ...hotels.map(x => x.price_from_kzt ?? 0))
        return Number.isFinite(m) ? m : 10000
    }, [hotels])

    const filtered = useMemo(() => {
        return hotels
            .filter(h => (h.rating ?? 0) >= minRating)
            .filter(h => (h.price_from_kzt ?? 0) <= maxPrice)
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    }, [hotels, minRating, maxPrice])

    const empty = !loading && filtered.length === 0

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Box sx={{ px: 2, pt: 2, maxWidth: 520, mx: 'auto' }}>
                {/* Header */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ bgcolor: '#fff', border: '1px solid rgba(16,24,40,0.10)' }}
                    >
                        <ArrowBackRoundedIcon />
                    </IconButton>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">Поиск</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Найди отели по городу и фильтрам
                        </Typography>
                    </Box>

                    <Button variant="text" onClick={() => navigate('/catalog')}>
                        Главная
                    </Button>
                </Stack>

                {/* Search bar */}
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
                            placeholder="Город (можно часть слова)"
                            sx={{ flex: 1, fontWeight: 900 }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setParams(city.trim() ? { city: city.trim() } : {})
                                    load()
                                }
                            }}
                        />

                        <IconButton
                            onClick={() => {
                                setParams(city.trim() ? { city: city.trim() } : {})
                                load()
                            }}
                            sx={{ bgcolor: 'primary.main', color: '#fff' }}
                        >
                            <SearchRoundedIcon />
                        </IconButton>

                        <IconButton onClick={() => setFiltersOpen(true)}>
                            <TuneRoundedIcon />
                        </IconButton>
                    </Stack>
                </Paper>

                {/* City chips */}
                <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 0.5 }}>
                    <Chip
                        label="Все"
                        clickable
                        onClick={() => {
                            setCity('')
                            setParams({})
                            load('')
                        }}
                        sx={{ bgcolor: '#fff' }}
                    />
                    {CITIES.map((c) => (
                        <Chip
                            key={c}
                            label={c}
                            clickable
                            onClick={() => {
                                setCity(c)
                                setParams({ city: c })
                                load(c)
                            }}
                            sx={{ bgcolor: '#fff' }}
                        />
                    ))}
                </Stack>

                {/* Results */}
                <Stack spacing={1.5}>
                    {loading && (
                        <>
                            <Skeleton variant="rounded" height={190} />
                            <Skeleton variant="rounded" height={190} />
                            <Skeleton variant="rounded" height={190} />
                        </>
                    )}

                    {!loading &&
                        filtered.map((h) => (
                            <HotelCardBookingLike
                                key={h.id}
                                h={h}
                                onClick={() => navigate(`/hotels/${h.id}`)}
                            />
                        ))}

                    {empty && (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fff' }}>
                            <Typography fontWeight={950}>Ничего не найдено</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Попробуй другой город или сбрось фильтры.
                            </Typography>
                        </Paper>
                    )}
                </Stack>
            </Box>

            {/* Filters Drawer */}
            <Drawer
                anchor="bottom"
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        p: 2,
                    },
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography fontWeight={950}>Фильтры</Typography>
                    <IconButton onClick={() => setFiltersOpen(false)}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>

                <Typography fontWeight={950} sx={{ mt: 1 }}>
                    Минимальный рейтинг
                </Typography>
                <Slider
                    value={minRating}
                    onChange={(_, v) => setMinRating(v)}
                    min={0}
                    max={5}
                    step={0.1}
                    valueLabelDisplay="auto"
                />

                <Typography fontWeight={950} sx={{ mt: 1 }}>
                    Макс. цена (₸)
                </Typography>
                <Slider
                    value={maxPrice}
                    onChange={(_, v) => setMaxPrice(v)}
                    min={0}
                    max={maxFromData}
                    step={500}
                    valueLabelDisplay="auto"
                />

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ borderRadius: 999 }}
                        onClick={() => {
                            setMinRating(0)
                            setMaxPrice(maxFromData)
                        }}
                    >
                        Сброс
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ borderRadius: 999 }}
                        onClick={() => setFiltersOpen(false)}
                    >
                        Готово
                    </Button>
                </Stack>
            </Drawer>
        </Box>
    )
}