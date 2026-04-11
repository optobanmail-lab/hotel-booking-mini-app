import { Routes, Route } from 'react-router-dom'

export default function App() {
    return (
        <Routes>
            <Route path="*" element={<div style={{ padding: 16 }}>OK ROUTER</div>} />
        </Routes>
    )
}