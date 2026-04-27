import { Card, Grid, Statistic, Typography } from '@arco-design/web-react';
import { IconEye, IconFile, IconFolder, IconTag } from '@arco-design/web-react/icon';
import { useEffect, useState } from 'react';

import { request } from '@blog/shared';
import styles from '../styles/dashboard.module.css';
import { useLocale } from '../locales';

const { Row, Col } = Grid;

interface DashboardStats {
    article_count: number;
    view_count: number;
    category_count: number;
    tag_count: number;
}

const statCards = [
    { key: 'articles', icon: <IconFile style={{ fontSize: 28 }} />, field: 'article_count' as const, gradient: 'var(--admin-gradient-blue)' },
    { key: 'views', icon: <IconEye style={{ fontSize: 28 }} />, field: 'view_count' as const, gradient: 'var(--admin-gradient-green)' },
    { key: 'categories', icon: <IconFolder style={{ fontSize: 28 }} />, field: 'category_count' as const, gradient: 'var(--admin-gradient-orange)' },
    { key: 'tags', icon: <IconTag style={{ fontSize: 28 }} />, field: 'tag_count' as const, gradient: 'var(--admin-gradient-purple)' },
];

export default function Dashboard() {
    const { t } = useLocale();
    const [stats, setStats] = useState<DashboardStats>({
        article_count: 0, view_count: 0, category_count: 0, tag_count: 0,
    });

    useEffect(() => {
        request.get('/dashboard/stats').then((res) => {
            setStats(res.data.data);
        }).catch(() => { /* ignore */ });
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Typography.Title heading={4}>{t('dashboard.title')}</Typography.Title>
            </div>
            <Row gutter={20}>
                {statCards.map((card) => (
                    <Col span={6} key={card.key}>
                        <div className={styles.statCard}>
                            <Card style={{ background: card.gradient, border: 'none' }}>
                                <div className="flex items-center gap-4">
                                    <div className={styles.statIconWrap}>
                                        {card.icon}
                                    </div>
                                    <Statistic
                                        title={t(`dashboard.${card.key}`)}
                                        value={stats[card.field]}
                                    />
                                </div>
                            </Card>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
