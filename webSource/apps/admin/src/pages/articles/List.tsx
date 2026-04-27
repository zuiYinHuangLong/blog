import { ARTICLE_STATUS, QRCODE_STATUS, formatDate, request } from '@blog/shared';
import type { Article, QRCode } from '@blog/shared';
import {
    Button,
    Card,
    Input,
    Message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
} from '@arco-design/web-react';
import { IconPlus, IconQrcode, IconSearch } from '@arco-design/web-react/icon';
import { useCallback, useEffect, useState } from 'react';

import { QRCodeSVG } from 'qrcode.react';
import { useLocale } from '../../locales';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function ArticleList() {
    const navigate = useNavigate();
    const { t } = useLocale();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<number | undefined>();
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [currentQr, setCurrentQr] = useState<{ title: string; url: string; qrcode?: QRCode } | null>(null);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, unknown> = { page, page_size: pageSize };
            if (keyword) params.keyword = keyword;
            if (statusFilter !== undefined) params.status = statusFilter;
            const res = await request.get('/articles', { params });
            setArticles(res.data.data.list || []);
            setTotal(res.data.data.total || 0);
        } catch {
            Message.error(t('article.fetchFailed'));
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, keyword, statusFilter, t]);

    useEffect(() => { fetchArticles(); }, [fetchArticles]);

    const handleDelete = async (id: number) => {
        try {
            await request.delete(`/articles/${id}`);
            Message.success(t('common.deleteSuccess'));
            fetchArticles();
        } catch {
            Message.error(t('common.deleteFailed'));
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: number) => {
        try {
            await request.put(`/articles/${id}/status`, {
                status: currentStatus === ARTICLE_STATUS.PUBLISHED ? ARTICLE_STATUS.DRAFT : ARTICLE_STATUS.PUBLISHED,
            });
            Message.success(t('article.statusUpdateSuccess'));
            fetchArticles();
        } catch {
            Message.error(t('article.statusUpdateFailed'));
        }
    };

    const showQrModal = (article: Article) => {
        const targetUrl = `${window.location.origin}/blog/article/${article.slug}`;
        setCurrentQr({ title: article.title, url: targetUrl, qrcode: article.qrcode });
        setQrModalVisible(true);
    };

    const getQrStatusTag = (qrcode?: QRCode) => {
        if (!qrcode) return <Tag color="gray">{t('qrcode.statusNotGenerated')}</Tag>;
        const map: Record<string, { color: string; key: string }> = {
            [QRCODE_STATUS.PENDING]: { color: 'orange', key: 'qrcode.statusPending' },
            [QRCODE_STATUS.APPROVED]: { color: 'blue', key: 'qrcode.statusApproved' },
            [QRCODE_STATUS.REJECTED]: { color: 'red', key: 'qrcode.statusRejected' },
            [QRCODE_STATUS.PUBLISHED]: { color: 'green', key: 'qrcode.statusPublished' },
        };
        const info = map[qrcode.status];
        return info ? <Tag color={info.color}>{t(info.key)}</Tag> : null;
    };

    const columns = [
        { title: t('common.id'), dataIndex: 'id', width: 60 },
        { title: t('article.articleTitle'), dataIndex: 'title', width: 250 },
        {
            title: t('common.status'),
            dataIndex: 'status',
            width: 80,
            render: (s: number) =>
                s === ARTICLE_STATUS.PUBLISHED
                    ? <Tag color="green">{t('article.published')}</Tag>
                    : <Tag color="gray">{t('article.draft')}</Tag>,
        },
        { title: t('article.category'), dataIndex: 'category_name', width: 100, render: (v: string) => v || '-' },
        { title: t('article.viewCount'), dataIndex: 'view_count', width: 80 },
        {
            title: t('article.qrcode'),
            dataIndex: 'qrcode',
            width: 120,
            render: (_: unknown, record: Article) => (
                <Space>
                    <Tooltip
                        content={
                            <div style={{ padding: 8, background: '#fff', borderRadius: 4 }}>
                                <QRCodeSVG
                                    value={`${window.location.origin}/blog/article/${record.slug}`}
                                    size={160}
                                />
                            </div>
                        }
                        position="top"
                        color="#fff"
                    >
                        <QRCodeSVG
                            value={`${window.location.origin}/blog/article/${record.slug}`}
                            size={32}
                            style={{ cursor: 'pointer' }}
                            onClick={() => showQrModal(record)}
                        />
                    </Tooltip>
                    {getQrStatusTag(record.qrcode)}
                </Space>
            ),
        },
        {
            title: t('article.publishedAt'),
            dataIndex: 'published_at',
            width: 160,
            render: (v: string) => formatDate(v),
        },
        {
            title: t('common.operation'),
            width: 220,
            render: (_: unknown, record: Article) => (
                <Space>
                    <Button type="text" size="small" onClick={() => navigate(`/articles/edit/${record.id}`)}>
                        {t('common.edit')}
                    </Button>
                    <Button type="text" size="small" onClick={() => handleToggleStatus(record.id, record.status)}>
                        {record.status === ARTICLE_STATUS.PUBLISHED ? t('article.unpublish') : t('article.publish')}
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        onClick={() => showQrModal(record)}
                    >
                        <IconQrcode /> {t('article.qrcode')}
                    </Button>
                    <Popconfirm title={t('common.confirmDelete')} onOk={() => handleDelete(record.id)}>
                        <Button type="text" size="small" status="danger">{t('common.delete')}</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Title heading={5} style={{ margin: 0 }}>{t('article.title')}</Title>
            </div>
            <Card>
                <div className="flex justify-between mb-4">
                    <Space>
                        <Input
                            prefix={<IconSearch />}
                            placeholder={t('article.searchPlaceholder')}
                            value={keyword}
                            onChange={setKeyword}
                            onPressEnter={fetchArticles}
                            style={{ width: 240 }}
                        />
                        <Select
                            placeholder={t('article.statusFilter')}
                            allowClear
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: 120 }}
                        >
                            <Select.Option value={ARTICLE_STATUS.PUBLISHED}>{t('article.published')}</Select.Option>
                            <Select.Option value={ARTICLE_STATUS.DRAFT}>{t('article.draft')}</Select.Option>
                        </Select>
                        <Button onClick={fetchArticles}>{t('common.filter')}</Button>
                    </Space>
                    <Button type="primary" icon={<IconPlus />} onClick={() => navigate('/articles/create')}>
                        {t('article.create')}
                    </Button>
                </div>
                <Table
                    columns={columns}
                    data={articles}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        total,
                        current: page,
                        pageSize,
                        onChange: setPage,
                        showTotal: true,
                    }}
                />
            </Card>

            <Modal
                title={`${t('article.qrcodeTitle')} - ${currentQr?.title || ''}`}
                visible={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={null}
                style={{ width: 400 }}
            >
                {currentQr && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <QRCodeSVG value={currentQr.url} size={240} />
                        <p style={{ marginTop: 16, color: '#666', fontSize: 12, wordBreak: 'break-all' }}>
                            {currentQr.url}
                        </p>
                        {currentQr.qrcode && (
                            <div style={{ marginTop: 12 }}>
                                {getQrStatusTag(currentQr.qrcode)}
                                {currentQr.qrcode.reject_reason && (
                                    <p style={{ color: '#f00', marginTop: 8 }}>{t('qrcode.rejectReason')}: {currentQr.qrcode.reject_reason}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
