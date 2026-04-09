import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { appBg } from '../ui/appBg'

export default function ProfilePage() {
    const navigate = useNavigate()

    return (
        <Box sx={{ minHeight: '100vh', ...appBg, pb: 12 }}>
            <Box sx={{ px: 2, pt: 2, maxWidth: 520, mx: 'auto' }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: '#fff' }}>
                    <Typography variant="h6">Профиль</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Настройки и админ-доступ
                    </Typography>

                    <Stack spacing={1}>
                        <Button variant="contained" sx={{ borderRadius: 999 }} onClick={() => navigate('/admin')}>
                            Admin Dashboard
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    )
}