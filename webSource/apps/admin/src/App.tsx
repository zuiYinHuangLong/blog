import { ConfigProvider } from '@arco-design/web-react';
import { RouterProvider } from 'react-router-dom';
import { LocaleProvider, useLocale, getArcoLocale } from './locales';
import router from './router';

function AppInner() {
    const { locale } = useLocale();
    return (
        <ConfigProvider locale={getArcoLocale(locale)}>
            <RouterProvider router={router} />
        </ConfigProvider>
    );
}

export default function App() {
    return (
        <LocaleProvider>
            <AppInner />
        </LocaleProvider>
    );
}
