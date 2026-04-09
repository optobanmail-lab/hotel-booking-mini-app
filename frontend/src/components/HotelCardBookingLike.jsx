import {
    Box,
    Button,
    Card,
    CardActionArea,
    Chip,
    Divider,
    Stack,
    Typography,
    IconButton,
} from '@mui/material'

import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'

function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n))
}

function ratingTo10(r5) {
    if (typeof r5 !== 'number') return null
    return Math.round(r5 * 2 * 10) / 10
}
function ratingLabel(r10) {
    if (r10 == null) return null
    if (r10 >= 9) return 'Великолепно'
    if (r10 >= 8) return 'Очень хорошо'
    if (r10 >= 7) return 'Хорошо'
    if (r10 >= 6) return 'Неплохо'
    return 'Нормально'
}

function StarsText({ count = 4 }) {
    const c = clamp(count, 0, 5)
    return (
        <Box sx={{ color: '#F79009', lineHeight: 1, fontSize: 13 }}>
            {'★'.repeat(c)}
            <Box component="span" sx={{ color: 'rgba(0,0,0,0.18)' }}>
                {'★'.repeat(5 - c)}
            </Box>
        </Box>
    )
}

export default function HotelCardBookingLike({ h, onClick }) {
    const photo = h.main_photo_url || 'https://picsum.photos/600/600'
    const price = Number(h.price_from_kzt ?? 0)

    const r10 = h.rating_value ?? ratingTo10(h.rating)
    const rLabel = h.rating_label ?? ratingLabel(r10)
    const reviews = h.reviews_count ?? 0

    const stars = h.stars ?? 4
    const distance = h.distance_to_center_km ?? 2.5
    const perks = h.perks ?? ['Бесплатная отмена', 'Предоплата не требуется']

    const oldPrice = h.old_price_kzt ?? (price ? Math.round(price * 1.18) : null)

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                borderColor: 'rgba(16,24,40,0.10)',
                bgcolor: '#fff',
            }}
        >
            {/* ВАЖНО: component="div" — чтобы не было <button> внутри <button> */}
            <CardActionArea component="div" onClick={onClick} sx={{ p: 1.25 }}>
                <Stack direction="row" spacing={1.25} alignItems="stretch">
                    {/* Image */}
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                        <Box
                            component="img"
                            src={photo}
                            alt={h.name}
                            loading="lazy"
                            decoding="async"
                            sx={{
                                width: 132,
                                height: 132,
                                borderRadius: 2,
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />

                        <IconButton
                            size="small"
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                bgcolor: 'rgba(255,255,255,0.92)',
                                border: '1px solid rgba(16,24,40,0.10)',
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                // тут можно сделать "избранное"
                            }}
                        >
                            <BookmarkBorderRoundedIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack spacing={0.6}>
                            <Box>
                                <Typography
                                    sx={{
                                        fontWeight: 950,
                                        fontSize: 16,
                                        color: '#0B5ED7',
                                        lineHeight: 1.15,
                                    }}
                                    noWrap
                                >
                                    {h.name}
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.3 }}>
                                    <StarsText count={stars} />
                                    <Typography variant="caption" color="text.secondary">
                                        {h.city ?? '—'}
                                    </Typography>
                                </Stack>
                            </Box>

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                                {r10 != null && (
                                    <Chip
                                        size="small"
                                        label={r10}
                                        sx={{
                                            bgcolor: '#155EEF',
                                            color: '#fff',
                                            fontWeight: 950,
                                            borderRadius: 1,
                                            height: 22,
                                        }}
                                    />
                                )}
                                {rLabel && <Typography variant="body2" sx={{ fontWeight: 950 }}>{rLabel}</Typography>}
                                <Typography variant="body2" color="text.secondary">
                                    · {reviews} отзывов
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={0.6} alignItems="center">
                                <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {h.city ?? '—'} · {distance} км от центра
                                </Typography>
                            </Stack>

                            <Stack spacing={0.3} sx={{ mt: 0.4 }}>
                                {perks.slice(0, 2).map((p) => (
                                    <Stack key={p} direction="row" spacing={0.7} alignItems="center">
                                        <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#12B76A' }} />
                                        <Typography variant="body2" sx={{ color: '#027A48', fontWeight: 900 }}>
                                            {p}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>

                            <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mt: 0.7 }}>
                                <Box>
                                    {oldPrice ? (
                                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                            KZT {oldPrice.toLocaleString('ru-RU')}
                                        </Typography>
                                    ) : (
                                        <Box sx={{ height: 18 }} />
                                    )}

                                    <Typography sx={{ fontWeight: 950, fontSize: 18, lineHeight: 1.1 }}>
                                        KZT {price.toLocaleString('ru-RU')}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        1 ночь · включая налоги и сборы
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        onClick?.()
                                    }}
                                    sx={{ borderRadius: 2, fontWeight: 950, px: 2, py: 0.9 }}
                                >
                                    Выбрать
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </CardActionArea>

            <Divider />

            <Box sx={{ px: 1.5, py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Войдите в аккаунт, чтобы увидеть персональные скидки (демо).
                </Typography>
            </Box>
        </Card>
    )
}