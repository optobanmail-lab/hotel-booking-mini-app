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

const PLACEHOLDER = '/news-placeholder.svg'

// важно: убираем слэш в конце, если он есть
const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

function openLink(url) {
    const tg = window.Telegram?.WebApp
    if (tg?.openLink) tg.openLink(url)
    else window.open(url, '_blank', 'noopener,noreferrer')
}

function proxyImg(url) {
    const u = (url || '').trim()
    if (!u) return PLACEHOLDER

    // если base не задан, пробуем относительный (для dev с прокси)
    if (!API_BASE) return `/api/img?url=${encodeURIComponent(u)}`
    return `${API_BASE}/api/img?url=${encodeURIComponent(u)}`
}

export default function HomeNewsPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let alive = true

        ;(async () => {
            setLoading(true)
            try {
                const data = await getNews(8)
                if (alive) setItems(Array.isArray(data) ? data : [])
            } finally {
                if (alive) setLoading(false)
            }
        })()

        // обновление раз в 5 минут
        const t = setInterval(async () => {
            if (document.visibilityState !== 'visible') return
            try {
                const data = await getNews(8)
                if (alive) setItems(Array.isArray(data) ? data : [])
            } catch {
                // не мешаем UI
            }
        }, 5 * 60 * 1000)

        return () => {
            alive = false
            clearInterval(t)
        }
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

                    {!loading &&
                        items.map((n, idx) => {
                            const url = n.url || n.link
                            const img = proxyImg(n.image_url)

                            return (
                                <Card key={(url || 'x') + idx} variant="outlined" sx={{ bgcolor: '#fff' }}>
                                    <CardActionArea onClick={() => url && openLink(url)}>
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
                                                    src={img}
                                                    alt=""
                                                    loading="lazy"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null
                                                        e.currentTarget.src = PLACEHOLDER
                                                    }}
                                                    sx={{
                                                        width: 92,
                                                        height: 92,
                                                        borderRadius: 2,
                                                        objectFit: 'cover',
                                                        flexShrink: 0,
                                                        border: '1px solid rgba(16,24,40,0.10)',
                                                        bgcolor: '#f3f4f6',
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
                            )
                        })}
                </Stack>
            </Box>
        </Box>
    )
}