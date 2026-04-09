import { useEffect, useState } from 'react'
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Stack,
    TextField,
    Toolbar,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    Chip,
} from '@mui/material'

import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'

import {
    adminAddRoom,
    adminCreateHotel,
    adminDeleteHotel,
    adminDeleteRoom,
    adminGetHotel,
    adminHotels,
    adminLogin,
    adminRefreshPhotos,
    clearAdminToken,
    getAdminToken,
} from '../adminApi'
import { appBg } from '../ui/appBg'

const surface = {
    borderRadius: 4,
    border: '1px solid rgba(16,24,40,0.10)',
    boxShadow: '0 18px 50px rgba(16,24,40,0.10)',
    bgcolor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
}

export default function AdminPage() {
    const [token, setToken] = useState(getAdminToken())
    const [password, setPassword] = useState('')

    const [items, setItems] = useState([])
    const [selected, setSelected] = useState(null) // details

    const [createOpen, setCreateOpen] = useState(false)
    const [roomOpen, setRoomOpen] = useState(false)

    const [hotelForm, setHotelForm] = useState({
        name: '',
        city: 'Алматы',
        address: '',
        lat: 0,
        lng: 0,
        rating: 4.6,
        reviews_count: 120,
    })

    const [roomForm, setRoomForm] = useState({
        name_ru: 'Стандарт',
        name_en: 'Standard',
        name_kk: 'Стандарт',
        price_per_night_kzt: 18000,
        quantity: 5,
    })

    async function loadHotels() {
        setItems(await adminHotels())
    }

    async function openHotel(id) {
        setSelected(await adminGetHotel(id))
    }

    useEffect(() => {
        if (token) loadHotels()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    async function doLogin() {
        const t = await adminLogin(password)
        setToken(t)
    }

    function logout() {
        clearAdminToken()
        setToken('')
        setPassword('')
        setItems([])
        setSelected(null)
    }

    if (!token) {
        return (
            <Box sx={{ minHeight: '100vh', ...appBg, display: 'grid', placeItems: 'center', p: 2 }}>
                <Card variant="outlined" sx={{ width: '100%', maxWidth: 420, ...surface }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={950} sx={{ mb: 1 }}>
                            Admin Login
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Введите пароль из backend/.env (ADMIN_PASSWORD)
                        </Typography>

                        <Stack spacing={2}>
                            <TextField
                                label="Пароль"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button variant="contained" onClick={doLogin} disabled={!password} sx={{ borderRadius: 999, py: 1.1 }}>
                                Войти
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', ...appBg }}>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.75)', color: 'text.primary', borderBottom: '1px solid rgba(16,24,40,0.08)', backdropFilter: 'blur(10px)' }}>
                <Toolbar>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>A</Avatar>
                            <Typography fontWeight={950}>Admin Dashboard</Typography>
                            <Chip size="small" label="Hotels" sx={{ ml: 1 }} />
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setCreateOpen(true)} sx={{ borderRadius: 999 }}>
                                Отель
                            </Button>
                            <Button color="error" variant="text" startIcon={<LogoutRoundedIcon />} onClick={logout}>
                                Выйти
                            </Button>
                        </Stack>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 2, maxWidth: 1100, mx: 'auto' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
                    {/* left list */}
                    <Paper sx={{ ...surface, flex: 1, minWidth: 320 }}>
                        <Box sx={{ p: 2 }}>
                            <Typography fontWeight={950} sx={{ mb: 1 }}>Отели</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                Кликни отель, чтобы управлять номерами и фото
                            </Typography>

                            <List dense sx={{ p: 0 }}>
                                {items.map((h) => (
                                    <ListItemButton
                                        key={h.id}
                                        selected={selected?.id === h.id}
                                        onClick={() => openHotel(h.id)}
                                        sx={{
                                            borderRadius: 2,
                                            mb: 0.5,
                                            border: '1px solid rgba(16,24,40,0.08)',
                                        }}
                                    >
                                        <ListItemText
                                            primary={<Typography fontWeight={950} noWrap>{h.name}</Typography>}
                                            secondary={<Typography variant="body2" color="text.secondary" noWrap>{h.city} · {h.address}</Typography>}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Box>
                    </Paper>

                    {/* right details */}
                    <Paper sx={{ ...surface, flex: 1.4 }}>
                        <Box sx={{ p: 2 }}>
                            <Typography fontWeight={950} sx={{ mb: 1 }}>Детали</Typography>

                            {!selected ? (
                                <Typography variant="body2" color="text.secondary">
                                    Выбери отель слева
                                </Typography>
                            ) : (
                                <>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography fontWeight={950} noWrap>{selected.name}</Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {selected.city} · {selected.address}
                                            </Typography>
                                        </Box>

                                        <Stack direction="row" spacing={1}>
                                            <IconButton
                                                title="Refresh photos"
                                                onClick={async () => {
                                                    await adminRefreshPhotos(selected.id)
                                                    await openHotel(selected.id)
                                                    await loadHotels()
                                                }}
                                            >
                                                <RefreshRoundedIcon />
                                            </IconButton>

                                            <IconButton
                                                title="Delete hotel"
                                                color="error"
                                                onClick={async () => {
                                                    await adminDeleteHotel(selected.id)
                                                    setSelected(null)
                                                    await loadHotels()
                                                }}
                                            >
                                                <DeleteOutlineRoundedIcon />
                                            </IconButton>
                                        </Stack>
                                    </Stack>

                                    <Divider sx={{ my: 2 }} />

                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                        <Typography fontWeight={950}>Номера</Typography>
                                        <Button variant="outlined" onClick={() => setRoomOpen(true)} sx={{ borderRadius: 999 }}>
                                            + Номер
                                        </Button>
                                    </Stack>

                                    <Stack spacing={1}>
                                        {selected.rooms.map((r) => (
                                            <Card key={r.id} variant="outlined" sx={{ borderRadius: 3 }}>
                                                <CardContent sx={{ py: 1.2 }}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography fontWeight={950} noWrap>{r.name_ru}</Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {r.price_per_night_kzt} ₸ · qty {r.quantity}
                                                            </Typography>
                                                        </Box>
                                                        <IconButton
                                                            color="error"
                                                            onClick={async () => {
                                                                await adminDeleteRoom(r.id)
                                                                await openHotel(selected.id)
                                                            }}
                                                        >
                                                            <DeleteOutlineRoundedIcon />
                                                        </IconButton>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Stack>

                {/* dialogs */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Создать отель</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField label="Название" value={hotelForm.name} onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })} />
                            <TextField label="Город" value={hotelForm.city} onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })} />
                            <TextField label="Адрес" value={hotelForm.address} onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })} />
                            <Stack direction="row" spacing={1}>
                                <TextField label="lat" type="number" value={hotelForm.lat} onChange={(e) => setHotelForm({ ...hotelForm, lat: Number(e.target.value) })} />
                                <TextField label="lng" type="number" value={hotelForm.lng} onChange={(e) => setHotelForm({ ...hotelForm, lng: Number(e.target.value) })} />
                            </Stack>

                            <Button
                                variant="contained"
                                sx={{ borderRadius: 999, py: 1.1 }}
                                disabled={!hotelForm.name || !hotelForm.city}
                                onClick={async () => {
                                    await adminCreateHotel(hotelForm)
                                    setCreateOpen(false)
                                    setHotelForm({ ...hotelForm, name: '', address: '' })
                                    await loadHotels()
                                }}
                            >
                                Создать
                            </Button>
                        </Stack>
                    </DialogContent>
                </Dialog>

                <Dialog open={roomOpen} onClose={() => setRoomOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Добавить номер</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField label="Название RU" value={roomForm.name_ru} onChange={(e) => setRoomForm({ ...roomForm, name_ru: e.target.value })} />
                            <TextField label="Цена за ночь (₸)" type="number" value={roomForm.price_per_night_kzt} onChange={(e) => setRoomForm({ ...roomForm, price_per_night_kzt: Number(e.target.value) })} />
                            <TextField label="Количество" type="number" value={roomForm.quantity} onChange={(e) => setRoomForm({ ...roomForm, quantity: Number(e.target.value) })} />

                            <Button
                                variant="contained"
                                sx={{ borderRadius: 999, py: 1.1 }}
                                disabled={!selected}
                                onClick={async () => {
                                    await adminAddRoom(selected.id, roomForm)
                                    setRoomOpen(false)
                                    await openHotel(selected.id)
                                }}
                            >
                                Добавить
                            </Button>
                        </Stack>
                    </DialogContent>
                </Dialog>
            </Box>
        </Box>
    )
}