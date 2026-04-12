import { Link, useLocation } from 'react-router-dom'

export default function LitePage() {
    const loc = useLocation()

    return (
        <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
            <div><b>Lite OK (debug)</b></div>
            <div style={{ marginTop: 8 }}>Path: <code>{loc.pathname}</code></div>

            <div style={{ marginTop: 12 }}>
                <div>Test links:</div>
                <ul>
                    <li><Link to="/test/home">/test/home</Link></li>
                    <li><Link to="/test/catalog">/test/catalog</Link></li>
                    <li><Link to="/test/search">/test/search</Link></li>
                    <li><Link to="/test/hotel/1">/test/hotel/1</Link></li>
                </ul>
            </div>
        </div>
    )
}