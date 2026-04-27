import '@arco-design/web-react/dist/css/arco.css';
import './styles/tailwind.css';
import './styles/global.css';

import App from './App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
