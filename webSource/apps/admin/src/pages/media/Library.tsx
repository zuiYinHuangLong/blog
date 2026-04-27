import { Card, Typography } from '@arco-design/web-react';
import { useLocale } from '../../locales';

const { Title } = Typography;

export default function MediaLibrary() {
    const { t } = useLocale();

    return (
        <Card>
            <Title heading={5} style={{ margin: 0 }}>{t('media.title')}</Title>
            <p style={{ marginTop: 12, color: 'var(--color-text-3)' }}>{t('media.description')}</p>
        </Card>
    );
}
