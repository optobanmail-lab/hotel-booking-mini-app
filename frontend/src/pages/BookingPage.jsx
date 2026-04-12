import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
} from '@mui/material'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded'
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import LocationCityRoundedIcon from '@mui/icons-material/LocationCityRounded'

// import { createBooking } from '../api'

function clampInt(n, min, max) {
    const x = Number(n)
    if (Number.isNaN(x)) return min
    return Math.max(min, Math.min(max, x))
}

// ФИО: только буквы (кириллица/латиница) + пробел/дефис/апостроф
// ВАЖНО: НЕ trim() здесь, иначе пробел между словами "съедается" и всё склеивается.
function sanitizeNameInput(value) {
    let v = String(value ?? '')
        .replace(/[^A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқӨөӘә\s'-]/g, '')
        .replace(/\s{2,}/g, ' ')   // двойные пробелы -> один
        .replace(/^\s+/g, '')      // убрать пробелы в начале
    return v.slice(0, 60)
}

function normalizeNameFinal(value) {
    return String(value ?? '').replace(/\s{2,}/g, ' ').trim()
}

// Город: только буквы + пробел/дефис
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

// телефон: 10 цифр после +7
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

// ввод "чисел" без ведущих нулей
function parseIntSafe(digits, fallback) {
    const s = String(digits ?? '').replace(/\D/g, '')
    if (!s) return fallback
    return parseInt(s, 10) // parseInt убирает ведущие нули => "02" -> 2
}

export default function BookingPage() {
    const navigate = useNavigate()

    const [form, setForm] = useState(() => ({
        checkIn: todayISO(),
        checkOut: todayISO(),
        adults: 1,
        children: 0,
        fullName: '',
        phone10: '', // 10 цифр
        city: '',
    }))

    const phoneFormatted = useMemo(() => formatPhone10(form.phone10), [form.phone10])

    const errors = useMemo(() => {
        const e = {}

        if (!form.checkIn) e.checkIn = 'Выберите дату заезда'
        if (!form.checkOut) e.checkOut = 'Выберите дату выезда'
        if (form.checkIn && form.checkOut && form.checkOut < form.checkIn) {
            e.checkOut = 'Выезд не может быть раньше заезда'
        }

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
    }, [form])

    const canSubmit = Object.keys(errors).length === 0

    async function onSubmit() {
        if (!canSubmit) return

        const payload = {
            check_in: form.checkIn,
            check_out: form.checkOut,
            adults: form.adults,
            children: form.children,
            full_name: normalizeNameFinal(form.fullName),
            phone: `+7${form.phone10}`,
            city: form.city.trim(),
        }

        // const res = await createBooking(payload)
        // navigate(`/bookings/${res.id}/confirmed`)

        console.log('BOOKING PAYLOAD', payload)
        navigate('/bookings')
    }

    return (
        <Box
            sx={{
                minHeight: '100dvh',
                background: 'linear-gradient(180deg, rgba(227,238,255,1) 0%, rgba(250,250,252,1) 55%)',
                pb: 12,
            }}
        >
            <Container maxWidth="sm" sx={{ pt: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ bgcolor: '#fff', border: '1px solid rgba(16,24,40,0.08)' }}
                    >
                        <ArrowBackRoundedIcon />
                    </IconButton>
                    <Box>
                        <Typography fontWeight={950} sx={{ lineHeight: 1.1, fontSize: 20 }}>
                            Бронирование
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Подтверждение мгновенно (демо)
                        </Typography>
                    </Box>
                </Stack>

                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.92)',
                        borderColor: 'rgba(16,24,40,0.10)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <Stack spacing={1.6}>
                        <Typography sx={{ fontWeight: 950, color: 'text.secondary', fontSize: 12, letterSpacing: 0.6 }}>
                            ДАТЫ
                        </Typography>

                        <Stack direction="row" spacing={1.2}>
                            <TextField
                                fullWidth
                                label="Заезд"
                                type="date"
                                value={form.checkIn}
                                onChange={(e) => {
                                    const next = e.target.value
                                    setForm((s) => ({
                                        ...s,
                                        checkIn: next,
                                        checkOut: s.checkOut < next ? next : s.checkOut,
                                    }))
                                }}
                                error={!!errors.checkIn}
                                helperText={errors.checkIn || ' '}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: todayISO() }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarMonthRoundedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarMonthRoundedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>

                        <Typography sx={{ fontWeight: 950, color: 'text.secondary', fontSize: 12, letterSpacing: 0.6 }}>
                            ГОСТИ
                        </Typography>

                        {/* Взрослые/Дети: делаем type="text" + inputMode numeric, чтобы не было "02" и спиннеров */}
                        <Stack direction="row" spacing={1.2}>
                            <TextField
                                fullWidth
                                label="Взрослые"
                                value={String(form.adults)}
                                onChange={(e) => {
                                    const n = parseIntSafe(e.target.value, 1)
                                    setForm((s) => ({ ...s, adults: clampInt(n, 1, 6) }))
                                }}
                                error={!!errors.adults}
                                helperText={errors.adults || ' '}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonRoundedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Дети"
                                value={String(form.children)}
                                onChange={(e) => {
                                    const n = parseIntSafe(e.target.value, 0)
                                    setForm((s) => ({ ...s, children: clampInt(n, 0, 6) }))
                                }}
                                error={!!errors.children}
                                helperText={errors.children || ' '}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ChildCareRoundedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>

                        {errors.people && (
                            <Typography variant="body2" sx={{ color: 'error.main', mt: -1 }}>
                                {errors.people}
                            </Typography>
                        )}

                        <Divider />

                        <Typography sx={{ fontWeight: 950, color: 'text.secondary', fontSize: 12, letterSpacing: 0.6 }}>
                            КОНТАКТЫ
                        </Typography>

                        <TextField
                            label="ФИО"
                            value={form.fullName}
                            onChange={(e) => setForm((s) => ({ ...s, fullName: sanitizeNameInput(e.target.value) }))}
                            onBlur={() => setForm((s) => ({ ...s, fullName: normalizeNameFinal(s.fullName) }))}
                            error={!!errors.fullName}
                            helperText={errors.fullName || 'Только буквы, пробел, дефис, апостроф'}
                            inputProps={{ maxLength: 60, autoComplete: 'name' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BadgeRoundedIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Телефон"
                            value={phoneFormatted} // только (XXX) XXX-XX-XX, без +7
                            onChange={(e) => {
                                // вынимаем цифры из того, что ввели/вставили
                                let digits = String(e.target.value).replace(/\D/g, '')

                                // если вставили полный номер +7XXXXXXXXXX или 8XXXXXXXXXX — отрежем код страны
                                if (digits.length >= 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
                                    digits = digits.slice(1)
                                }

                                // максимум 10 цифр
                                digits = digits.slice(0, 10)

                                setForm((s) => ({ ...s, phone10: digits }))
                            }}
                            error={!!errors.phone}
                            helperText={errors.phone || 'Формат: +7 и 10 цифр'}
                            placeholder="(7__) ___-__-__"
                            inputProps={{
                                inputMode: 'numeric',
                                autoComplete: 'tel',
                                maxLength: 18, // длина форматированной строки
                            }}
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
                            inputProps={{ maxLength: 40, autoComplete: 'address-level2' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocationCityRoundedIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            variant="contained"
                            size="large"
                            disabled={!canSubmit}
                            onClick={onSubmit}
                            sx={{ borderRadius: 3, py: 1.2, fontWeight: 950 }}
                        >
                            Подтвердить
                        </Button>

                        {!canSubmit && (
                            <Typography variant="caption" color="text.secondary">
                                Заполните поля корректно, чтобы подтвердить бронирование.
                            </Typography>
                        )}
                    </Stack>
                </Paper>
            </Container>
        </Box>
    )
}