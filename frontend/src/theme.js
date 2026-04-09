import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
    shape: { borderRadius: 18 },
    palette: {
        mode: 'light',
        primary: { main: '#155EEF' },
        success: { main: '#12B76A' },
        warning: { main: '#F79009' },
        background: { default: '#F6F7FB', paper: '#FFFFFF' },
        text: { primary: '#0B1220' },
    },
    typography: {
        fontFamily: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial'].join(','),
        h4: { fontWeight: 950, letterSpacing: -0.4 },
        h6: { fontWeight: 950, letterSpacing: -0.2 },
        subtitle1: { fontWeight: 900 },
        button: { fontWeight: 900 },
    },
    components: {
        MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
        MuiCard: {
            styleOverrides: {
                root: { borderRadius: 20, borderColor: 'rgba(16,24,40,0.10)' },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { textTransform: 'none', borderRadius: 14, fontWeight: 950 },
            },
        },
        MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 900 } } },
        MuiTextField: { defaultProps: { size: 'small' } },
    },
})