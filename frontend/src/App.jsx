import { Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'

export default function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="*" element={<div style={{ padding: 16 }}>OK BOTTOMBAR</div>} />
            </Route>
        </Routes>
    )
}