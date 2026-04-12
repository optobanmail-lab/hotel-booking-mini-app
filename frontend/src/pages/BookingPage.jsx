import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
    MenuItem,
    CircularProgress,
} from '@mui/material'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded'
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import LocationCityRoundedIcon from '@mui/icons-material/LocationCityRounded'
import BedRoundedIcon from '@mui/icons-material/BedRounded'

import { createBooking, getHotel } from '../api'

function clampInt(n, min, max) {
    const x = Number(n)
    if (Number.isNaN(x)) return min
    return Math.max(min, Math.min(max, x))
}

function sanitizeNameInput(value) {
    let v = String(value ?? '')
        .replace(/[^A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқӨөӘә\s'-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/^\s+/g, '')
    return v.slice(0, 60)
}
function normalizeNameFinal(value) {
    return String(value ?? '').replace(/\s{2,}/g, ' ').trim()
}

function sanitizeCity(value) {
    const v = String(value ?? '')
        .replace(/[^A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқӨөӘә\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    return v.slice(0, 40)
}

function todayISO() {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.toISOString().slice(0, 10)
}

function formatPhone10(d10) {
    const d = String(d10 || '').replace(/\D/g, '').slice(0, 10)
    const p1 = d.slice(0, 3)
    const p2 = d.slice(3, 6)
    const p3 = d.slice(6, 8)
    const p4 = d.slice(8, 10)

    let out = ''
    if (p1) out += `(${p1}`
    if (p1.length === 3) out += ')'
    if (p2) out += ` ${p2}`
    if (p3) out += `-${p3}`
    if (p4) out += `-${p4}`
    return out.trim()
}

function parseIntSafe(digits, fallback) {
    const s = String(digits ?? '').replace(/\D/g, '')
    if (!s) return fallback
    return parseInt(s, 10)
}

function axiosErrorText(err) {
    const status = err?.response?.status
    const data = err?.response?.data
    if (status) {
        if (typeof data === 'string') return `${status}: ${data}`
        if (data?.detail) return `${status}: ${data.detail}`
        return `${status}: Ошибка сервера`
    }
    return err?.message || 'Ошибка сети'
}

export default function BookingPage() {
    const navigate = useNavigate()
    const [params] = useSearchParams()

    const hotelId = Number(params.get('hotelId') || 0) || null

    const [hotel, setHotel] = useState(null)
    const [roomTypes, setRoomTypes] = useState([])
    const [roomTypeId, setRoomTypeId] = useState('')

    const [form, setForm] = useState(() => ({
        checkIn: todayISO(),
        checkOut: todayISO(),
        adults: 1,
        children: 0,
        fullName: '',
        phone10: '',
        city: '',
    }))

    const [loadingHotel, setLoadingHotel] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    const phoneFormatted = useMemo(() => formatPhone10(form.phone10), [form.phone10])

    useEffect(() => {
        if (!hotelId) return
        let alive = true

        ;(async () => {
            setLoadingHotel(true)
            try {
                const h = await getHotel(hotelId)
                if (!alive) return

                setHotel(h)

                // под разные названия (чтобы не гадать)
                const rts = h?.room_types || h?.roomTypes || h?.rooms || h?.room_type_list || []
                const arr = Array.isArray(rts) ? rts : []
                setRoomTypes(arr)

                const first = arr[0]?.id ? String(arr[0].id) : ''
                setRoomTypeId(first)
            } finally {
                if (alive) setLoadingHotel(false)
            }
        })()

        return () => {
            alive = false
        }
    }, [hotelId])

    const errors = useMemo(() => {
        const e = {}

        if (!hotelId) e.hotelId = 'Откройте бронирование из карточки отеля'
        if (!roomTypeId) e.roomTypeId = 'Выберите тип номера'

        if (!form.checkIn) e.checkIn = 'Выберите дату заезда'
        if (!form.checkOut) e.checkOut = 'Выберите дату выезда'
        if (form.checkIn && form.checkOut && form.checkOut < form.checkIn) e.checkOut = 'Выезд не может быть раньше заезда'

        if (form.adults < 1) e.adults = 'Минимум 1 взрослый'
        if (form.adults > 6) e.adults = 'Максимум 6 взрослых'
        if (form.children < 0) e.children = 'Не может быть меньше 0'
        if (form.children > 6) e.children = 'Максимум 6 детей'
        if (form.adults + form.children > 8) e.people = 'Максимум 8 гостей'

        const nameFinal = normalizeNameFinal(form.fullName)
        if (!nameFinal) e.fullName = 'Введите ФИО'
        else if (nameFinal.length < 3) e.fullName = 'Слишком коротко'

        if (String(form.phone10).length !== 10) e.phone = 'Введите 10 цифр номера'
        if (!form.city.trim()) e.city = 'Укажите город назначения'

        return e
    }, [form, hotelId, roomTypeId])

    const canSubmit = Object.keys(errors).length === 0

    async function onSubmit() {
        if (!canSubmit || submitting) return

        setSubmitError('')
        setSubmitting(true)
        try {
            const payload = {
                hotel_id: hotelId,
                room_type_id: Number(roomTypeId),
                check_in: form.checkIn,
                check_out: form.checkOut,
                adults: form.adults,
                children: form.children,
                full_name: normalizeNameFinal(form.fullName),
                phone: `+7${form.phone10}`,
                city: form.city.trim(),
            }

            const res = await createBooking(payload)

            if (res?.id) navigate(`/bookings/${res.id}/confirmed`)
            else navigate('/bookings')
        } catch (err) {
            setSubmitError(axiosErrorText(err))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Box sx={{ minHeight: '100dvh', background: 'linear-gradient(180deg, rgba(227,238,255,1) 0%, rgba(250,250,252,1) 55%)', pb: 12 }}>
            <Container maxWidth="sm" sx={{ pt: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#fff', border: '1px solid rgba(16,24,40,0.08)' }}>
                        <ArrowBackRoundedIcon />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={950} sx={{ lineHeight: 1.1, fontSize: 20 }} noWrap>
                            Бронирование
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {hotel?.name || 'Подтверждение (демо)'}
                        </Typography>
                    </Box>
                </Stack>

                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.92)', borderColor: 'rgba(16,24,40,0.10)', backdropFilter: 'blur(8px)' }}>
                    <Stack spacing={1.6}>
                        {submitError && <Alert severity="error">{submitError}</Alert>}
                        {errors.hotelId && <Alert severity="warning">{errors.hotelId}</Alert>}

                        <TextField
                            select
                            label="Тип номера"
                            value={roomTypeId}
                            onChange={(e) => setRoomTypeId(e.target.value)}
                            error={!!errors.roomTypeId}
                            helperText={errors.roomTypeId || ' '}
                            disabled={loadingHotel}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BedRoundedIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            {roomTypes.map((rt) => (
                                <MenuItem key={rt.id} value={String(rt.id)}>
                                    {rt.name_ru || rt.name || `Room #${rt.id}`} — {rt.price_per_night_kzt ?? rt.price ?? '—'} ₸
                                </MenuItem>
                            ))}
                            {roomTypes.length === 0 && (
                                <MenuItem value="" disabled>
                                    {loadingHotel ? 'Загрузка...' : 'Нет типов номеров'}
                                </MenuItem>
                            )}
                        </TextField>

                        <Divider />

                        <Stack direction="row" spacing={1.2}>
                            <TextField
                                fullWidth
                                label="Заезд"
                                type="date"
                                value={form.checkIn}
                                onChange={(e) => {
                                    const next = e.target.value
                                    setForm((s) => ({ ...s, checkIn: next, checkOut: s.checkOut < next ? next : s.checkOut }))
                                }}
                                error={!!errors.checkIn}
                                helperText={errors.checkIn || ' '}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: todayISO() }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthRoundedIcon fontSize="small" /></InputAdornment> }}
                            />
                            <TextField
                                fullWidth
                                label="Выезд"
                                type="date"
                                value={form.checkOut}
                                onChange={(e) => setForm((s) => ({ ...s, checkOut: e.target.value }))}
                                error={!!errors.checkOut}
                                helperText={errors.checkOut || ' '}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: form.checkIn || todayISO() }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthRoundedIcon fontSize="small" /></InputAdornment> }}
                            />
                        </Stack>

                        <Stack direction="row" spacing={1.2}>
                            <TextField
                                fullWidth
                                label="Взрослые"
                                value={String(form.adults)}
                                onChange={(e) => setForm((s) => ({ ...s, adults: clampInt(parseIntSafe(e.target.value, 1), 1, 6) }))}
                                error={!!errors.adults}
                                helperText={errors.adults || ' '}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonRoundedIcon fontSize="small" /></InputAdornment> }}
                            />
                            <TextField
                                fullWidth
                                label="Дети"
                                value={String(form.children)}
                                onChange={(e) => setForm((s) => ({ ...s, children: clampInt(parseIntSafe(e.target.value, 0), 0, 6) }))}
                                error={!!errors.children}
                                helperText={errors.children || ' '}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><ChildCareRoundedIcon fontSize="small" /></InputAdornment> }}
                            />
                        </Stack>

                        {errors.people && <Typography variant="body2" sx={{ color: 'error.main', mt: -1 }}>{errors.people}</Typography>}

                        <Divider />

                        <TextField
                            label="ФИО"
                            value={form.fullName}
                            onChange={(e) => setForm((s) => ({ ...s, fullName: sanitizeNameInput(e.target.value) }))}
                            onBlur={() => setForm((s) => ({ ...s, fullName: normalizeNameFinal(s.fullName) }))}
                            error={!!errors.fullName}
                            helperText={errors.fullName || ' '}
                            inputProps={{ maxLength: 60 }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeRoundedIcon fontSize="small" /></InputAdornment> }}
                        />

                        <TextField
                            label="Телефон"
                            value={phoneFormatted}
                            onChange={(e) => {
                                let digits = String(e.target.value).replace(/\D/g, '')
                                if (digits.length >= 11 && (digits.startsWith('7') || digits.startsWith('8'))) digits = digits.slice(1)
                                digits = digits.slice(0, 10)
                                setForm((s) => ({ ...s, phone10: digits }))
                            }}
                            error={!!errors.phone}
                            helperText={errors.phone || ' '}
                            placeholder="(7__) ___-__-__"
                            inputProps={{ inputMode: 'numeric', autoComplete: 'tel', maxLength: 18 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIphoneRoundedIcon fontSize="small" />
                                        <Box sx={{ ml: 0.8, fontWeight: 900 }}>+7</Box>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Город (назначение)"
                            value={form.city}
                            onChange={(e) => setForm((s) => ({ ...s, city: sanitizeCity(e.target.value) }))}
                            error={!!errors.city}
                            helperText={errors.city || ' '}
                            inputProps={{ maxLength: 40 }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><LocationCityRoundedIcon fontSize="small" /></InputAdornment> }}
                        />

                        <Button
                            variant="contained"
                            size="large"
                            disabled={!canSubmit || submitting}
                            onClick={onSubmit}
                            sx={{ borderRadius: 3, py: 1.2, fontWeight: 950 }}
                            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                        >
                            Подтвердить
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    )
}