import Button from '@mui/material/Button'
import { requestTelegramFullscreen, tg } from '../telegram'

export default function TelegramFullscreenButton() {
    // В обычном браузере кнопку не показываем
    if (!tg()) return null

    return (
        <Button variant="contained" size="small" onClick={requestTelegramFullscreen}>
            На весь экран
        </Button>
    )
}