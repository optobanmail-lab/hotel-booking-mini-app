import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import BottomBar from '../components/BottomBar'
import PageTransition from '../components/PageTransition'

export default function AppLayout() {
    const location = useLocation()
    const isAdmin = location.pathname.startsWith('/admin')

    const isTelegram = !!window.Telegram?.WebApp
    const transitionsEnabled = !isTelegram

    return (
        <Box
            className="phone-frame"
            sx={{
                // на мобилке/Telegram рамка не нужна — будет обычная ширина
                width: { xs: '100%', md: '100%' },
                height: { xs: '100dvh', md: '100%' },

                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: 'transparent',
            }}
        >
            {/* единственный скролл-контейнер */}
            <Box
                id="app-scroll"
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',

                    // верх: Telegram-кнопки + notch + небольшой отступ
                    pt: 'calc(var(--tg-top, 0px) + env(safe-area-inset-top) + 8px)',

                    // низ: чтобы контент не залезал под BottomBar и home-indicator
                    pb: isAdmin
                        ? 'calc(var(--tg-bottom, 0px) + env(safe-area-inset-bottom))'
                        : 'calc(88px + var(--tg-bottom, 0px) + env(safe-area-inset-bottom))',

                    pl: 'env(safe-area-inset-left)',
                    pr: 'env(safe-area-inset-right)',
                }}
            >
                <PageTransition enabled={transitionsEnabled} routeKey={location.pathname}>
                    <Outlet />
                </PageTransition>
            </Box>

            {!isAdmin && <BottomBar />}
        </Box>
    )
}