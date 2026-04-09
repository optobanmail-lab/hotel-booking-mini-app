import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { appBg } from '../ui/appBg'
import { getHotel } from '../api'

export default function HotelDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [hotel, setHotel] = useState(null)

    useEffect(() => { getHotel(id).then(setHotel) }, [id])
    if (!hotel) return <Box sx={{ p: 2 }}>Загрузка…</Box>

    const cover = hotel.photo_urls?.[0] || hotel.rooms?.[0]?.photo_urls?.[0] || 'https://picsum.photos/900/600'

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Box sx={{ position: 'relative' }}>
                <Box component="img" src={cover} alt={hotel.name} sx={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }} />
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.65))' }} />

                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{ position: 'absolute', left: 14, top: 14, bgcolor: 'rgba(255,255,255,0.86)', border: '1px solid rgba(16,24,40,0.10)' }}
                >
                    <ArrowBackRoundedIcon />
                </IconButton>

                <Box sx={{ position: 'absolute', left: 16, right: 16, bottom: 14, color: '#fff' }}>
                    <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1.1 }}>{hotel.name}</Typography>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.8, flexWrap: 'wrap' }}>
                        <Chip
                            size="small"
                            icon={<StarRoundedIcon />}
                            label={`${hotel.rating} (${hotel.reviews_count})`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.86)', fontWeight: 950 }}
                        />
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ opacity: 0.95 }}>
                            <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
                            <Typography sx={{ fontSize: 12 }}>{hotel.address}</Typography>
                        </Stack>
                    </Stack>
                </Box>
            </Box>

            <Box sx={{ px: 2, maxWidth: 520, mx: 'auto', mt: 2 }}>
                <Typography fontWeight={950} sx={{ mb: 1 }}>Номера</Typography>

                <Stack spacing={2}>
                    {hotel.rooms.map((r) => (
                        <Card key={r.id} variant="outlined" sx={{ borderRadius: 4, bgcolor: '#fff' }}>
                            <CardContent>
                                <Stack direction="row" spacing={1.2}>
                                    <Box component="img" src={r.photo_urls?.[0] || cover} alt={r.name_ru}
                                         sx={{ width: 96, height: 96, borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography fontWeight={950} noWrap>{r.name_ru}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {r.price_per_night_kzt} ₸ / ночь • кол-во: {r.quantity}
                                        </Typography>

                                        <Button
                                            variant="contained"
                                            sx={{ mt: 1, borderRadius: 999 }}
                                            onClick={() => navigate(`/booking/new?hotelId=${hotel.id}&roomTypeId=${r.id}`)}
                                        >
                                            Забронировать
                                        </Button>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Box>
        </Box>
    )
}