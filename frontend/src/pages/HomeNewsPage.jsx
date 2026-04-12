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
    IconButton,
} from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { appBg } from '../ui/appBg'
import { getNews } from '../api'

const PLACEHOLDER = '/news-placeholder.svg'
const REFRESH_MS = 5 * 60 * 1000 // 5 минут

function openLink(url) {
    const tg = window.Telegram?.WebApp
    if (tg?.openLink) tg.openLink(url)
    else window.open(url, '_blank', 'noopener,noreferrer')
}

function imgSrc(url) {
    const u = (url || '').trim()
    return u ? u : PLACEHOLDER
}

export default function HomeNewsPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

    async function load() {
        setLoading(true)
        try {
            const data = await getNews(8)
            setItems(Array.isArray(data) ? data : [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let alive = true

        ;(async () => {
            await load()
        })()

        const t = setInterval(() => {
            if (!alive) return
            // обновляем только когда вкладка активна
            if (document.visibilityState === 'visible') load()
        }, REFRESH_MS)

        const onVis = () => {
            if (document.visibilityState === 'visible') load()
        }
        document.addEventListener('visibilitychange', onVis)

        return () => {
            alive = false
            clearInterval(t)
            document.removeEventListener('visibilitychange', onVis)
        }
    }, [])

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Box sx={{ px: 2, pt: 2, maxWidth: 520, mx: 'auto' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="h6" fontWeight={950}>
                        Новости: отели Казахстана
                    </Typography>

                    <IconButton onClick={load} disabled={loading} size="small">
                        <RefreshRoundedIcon />
                    </IconButton>
                </Stack>

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
                            const url = n.url || n.link // на всякий случай
                            const photo = imgSrc(n.image_url)

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
                                                    src={photo}
                                                    alt=""
                                                    loading="lazy"
                                                    decoding="async"
                                                    referrerPolicy="no-referrer"
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