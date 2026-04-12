import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material'

const PLACEHOLDER = '/hotel-placeholder.svg'

function photoSrc(url) {
    const u = (url ?? '').trim()
    return u ? u : PLACEHOLDER
}

export default function HotelCard({ hotel, onClick }) {
    const photo = photoSrc(hotel?.main_photo_url)

    return (
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
            <CardActionArea onClick={onClick}>
                <Box sx={{ position: 'relative' }}>
                    <Box
                        component="img"
                        src={photo}
                        alt={hotel?.name ?? 'Hotel'}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = PLACEHOLDER
                        }}
                        sx={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', bgcolor: '#f3f4f6' }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)',
                        }}
                    />
                    <Box sx={{ position: 'absolute', left: 12, right: 12, bottom: 10, color: '#fff' }}>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                            {hotel?.name ?? '—'}
                        </Typography>
                        <Typography sx={{ opacity: 0.9, fontSize: 12 }}>
                            {hotel?.address ?? '—'}
                        </Typography>
                    </Box>
                </Box>

                <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" label={`⭐ ${hotel?.rating ?? '—'} (${hotel?.reviews_count ?? 0})`} />
                            <Chip size="small" variant="outlined" label={hotel?.city ?? '—'} />
                        </Stack>

                        <Typography fontWeight={900}>
                            от {hotel?.price_from_kzt ?? 0} ₸
                        </Typography>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}