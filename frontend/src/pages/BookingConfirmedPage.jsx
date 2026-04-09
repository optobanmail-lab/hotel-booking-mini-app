import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { appBg } from '../ui/appBg'

export default function BookingConfirmedPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12, display: 'grid', placeItems: 'center', px: 2 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#fff', width: '100%', maxWidth: 520 }}>
                <Typography variant="h5" fontWeight={950} sx={{ mb: 1 }}>
                    Бронирование подтверждено
                </Typography>
                <Typography sx={{ mb: 2 }}>Номер: #{id}</Typography>

                <Stack spacing={1}>
                    <Button variant="contained" sx={{ borderRadius: 999 }} onClick={() => navigate('/bookings')}>
                        Мои бронирования
                    </Button>
                    <Button variant="outlined" sx={{ borderRadius: 999 }} onClick={() => navigate('/catalog')}>
                        В каталог
                    </Button>
                </Stack>
            </Paper>
        </Box>
    )
}