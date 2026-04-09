import { useEffect, useState } from 'react'
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material'
import { appBg } from '../ui/appBg'
import { getNews } from '../api'

function openLink(url) {
    const tg = window.Telegram?.WebApp
    if (tg?.openLink) tg.openLink(url)
    else window.open(url, '_blank')
}

export default function HomeNewsPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        ;(async () => {
            setLoading(true)
            try {
                setItems(await getNews(8))
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Box sx={{ px: 2, pt: 2, maxWidth: 520, mx: 'auto' }}>
                <Typography variant="h6" fontWeight={950} sx={{ mb: 0.5 }}>
                    Новости: отели Казахстана
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Реальные статьи · Google News RSS
                </Typography>

                <Stack spacing={1.5}>
                    {loading && (
                        <>
                            <Skeleton variant="rounded" height={120} />
                            <Skeleton variant="rounded" height={120} />
                            <Skeleton variant="rounded" height={120} />
                        </>
                    )}

                    {!loading && items.map((n, idx) => (
                        <Card key={(n.url || 'x') + idx} variant="outlined" sx={{ bgcolor: '#fff' }}>
                            <CardActionArea onClick={() => n.url && openLink(n.url)}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Chip size="small" label={n.source || 'News'} />
                                        <Typography variant="caption" color="text.secondary">
                                            {n.published || ''}
                                        </Typography>
                                    </Stack>

                                    <Stack direction="row" spacing={1.2} sx={{ mt: 1 }} alignItems="flex-start">
                                        <Box
                                            component="img"
                                            src={n.image_url}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => {
                                                // если вдруг картинка не загрузилась — поменяем sig
                                                e.currentTarget.src = `${n.image_url}&sig=${Date.now()}`
                                            }}
                                            sx={{
                                                width: 92,
                                                height: 92,
                                                borderRadius: 2,
                                                objectFit: 'cover',
                                                flexShrink: 0,
                                                border: '1px solid rgba(16,24,40,0.10)',
                                            }}
                                        />

                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography fontWeight={950} sx={{ lineHeight: 1.2 }}>
                                                {n.title}
                                            </Typography>

                                            {n.summary && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {String(n.summary).slice(0, 160)}…
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Stack>
            </Box>
        </Box>
    )
}