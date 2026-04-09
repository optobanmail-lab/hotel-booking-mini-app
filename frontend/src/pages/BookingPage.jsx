import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { appBg } from '../ui/appBg'
import { createBooking } from '../api'

const cardSx = {
    borderRadius: 7,
    p: 2,
    bgcolor: '#fff',
    border: '1px solid rgba(16,24,40,0.10)',
    boxShadow: '0 20px 50px rgba(16,24,40,0.10)',
}

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 4,
        backgroundColor: 'rgba(246,247,251,0.75)',
    },
}

export default function BookingPage() {
    const navigate = useNavigate()
    const [params] = useSearchParams()

    const hotelId = Number(params.get('hotelId'))
    const roomTypeId = Number(params.get('roomTypeId'))

    const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
    const tomorrow = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        return d.toISOString().slice(0, 10)
    }, [])

    const [checkIn, setCheckIn] = useState(today)
    const [checkOut, setCheckOut] = useState(tomorrow)
    const [adults, setAdults] = useState(2)
    const [children, setChildren] = useState(0)
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('+77')
    const [city, setCity] = useState('')

    const disabled = !fullName || phone.length < 4

    async function submit() {
        const booking = await createBooking({
            hotel_id: hotelId,
            room_type_id: roomTypeId,
            check_in: checkIn,
            check_out: checkOut,
            adults,
            children,
            full_name: fullName,
            phone,
            city: city || '—',
        })
        navigate(`/bookings/${booking.id}/confirmed`)
    }

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Box sx={{ px: 2, pt: 2, maxWidth: 520, mx: 'auto' }}>
                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#fff', border: '1px solid rgba(16,24,40,0.10)' }}>
                        <ArrowBackRoundedIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h6">Бронирование</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Подтверждение мгновенно (демо)
                        </Typography>
                    </Box>
                </Stack>

                <Paper variant="outlined" sx={cardSx}>
                    <Stack spacing={1.6}>
                        <TextField sx={fieldSx} type="date" label="Заезд" InputLabelProps={{ shrink: true }} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                        <TextField sx={fieldSx} type="date" label="Выезд" InputLabelProps={{ shrink: true }} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                        <TextField sx={fieldSx} type="number" label="Взрослые" value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
                        <TextField sx={fieldSx} type="number" label="Дети" value={children} onChange={(e) => setChildren(Number(e.target.value))} />
                        <TextField sx={fieldSx} label="ФИО" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        <TextField sx={fieldSx} label="Телефон (+77...)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <TextField sx={fieldSx} label="Город (назначение)" value={city} onChange={(e) => setCity(e.target.value)} />

                        <Button variant="contained" onClick={submit} disabled={disabled} sx={{ borderRadius: 999, py: 1.2 }}>
                            Подтвердить
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    )
}