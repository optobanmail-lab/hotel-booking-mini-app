import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { appBg } from '../ui/appBg'
import { cancelBooking, myBookings } from '../api'

export default function MyBookingsPage() {
    const [items, setItems] = useState([])

    async function load() {
        setItems(await myBookings())
    }

    useEffect(() => { load() }, [])

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Box sx={{ px: 2, pt: 2, maxWidth: 520, mx: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Мои бронирования</Typography>

                <Stack spacing={2}>
                    {items.map((b) => (
                        <Card key={b.id} variant="outlined" sx={{ bgcolor: '#fff' }}>
                            <CardContent>
                                <Typography fontWeight={950}>Бронь #{b.id} — {b.status}</Typography>
                                <Typography variant="body2">Даты: {b.check_in} → {b.check_out}</Typography>
                                <Typography variant="body2">Сумма: {b.total_price_kzt} ₸</Typography>

                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    <Button
                                        color="error"
                                        variant="contained"
                                        disabled={b.status === 'cancelled'}
                                        onClick={async () => { await cancelBooking(b.id); await load() }}
                                        sx={{ borderRadius: 999 }}
                                    >
                                        Отменить
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Box>
        </Box>
    )
}