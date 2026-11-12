import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ThemeContext from './Context/ThemeContext.jsx'
import ScrollToTop from './assets/Components/ScrollToTop'

createRoot(document.getElementById('root')).render(
    <ThemeContext>

        <BrowserRouter>
            <ScrollToTop />
            <App />
        </BrowserRouter>
    </ThemeContext>

)
