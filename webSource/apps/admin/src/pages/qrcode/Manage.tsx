import { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Card, Space, Tag, Select, Modal, Input, Message, Popconfirm, Typography,
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { request, formatDate, QRCODE_STATUS } from '@blog/shared';
import type { QRCode, Article } from '@blog/shared';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../../store/authStore';
import { useLocale } from '../../locales';

const { Title } = Typography;

export default function QRCodeManage() {
    const { t } = useLocale();
    const [qrcodes, setQrcodes] = useState<QRCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewQr, setPreviewQr] = useState<QRCode | null>(null);
    const [rejectVisible, setRejectVisible] = useState(false);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [createVisible, setCreateVisible] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticleId, setSelectedArticleId] = useState<number | undefined>();
    const { hasPermission } = useAuthStore();

    const statusMap: Record<string, { color: string; key: string }> = {
        [QRCODE_STATUS.PENDING]: { color: 'orange', key: 'qrcode.statusPending' },
        [QRCODE_STATUS.APPROVED]: { color: 'blue', key: 'qrcode.statusApproved' },
        [QRCODE_STATUS.REJECTED]: { color: 'red', key: 'qrcode.statusRejected' },
        [QRCODE_STATUS.PUBLISHED]: { color: 'green', key: 'qrcode.statusPublished' },
    };

    const fetchQrcodes = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, unknown> = {};
            if (statusFilter) params.status = statusFilter;
            const res = await request.get('/qrcodes', { params });
            setQrcodes(res.data.data.list || res.data.data || []);
        } catch {
            Message.error(t('qrcode.fetchFailed'));
        } finally {
            setLoading(false);
        }
    }, [statusFilter, t]);

    useEffect(() => { fetchQrcodes(); }, [fetchQrcodes]);

    const handleCreate = async () => {
        if (!selectedArticleId) {
            Message.warning(t('qrcode.selectArticleRequired'));
            return;
        }
        try {
            await request.post('/qrcodes', { article_id: selectedArticleId });
            Message.success(t('qrcode.created'));
            setCreateVisible(false);
            setSelectedArticleId(undefined);
            fetchQrcodes();
        } catch {
            Message.error(t('qrcode.generateFailed'));
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await request.put(`/qrcodes/${id}/approve`);
            Message.success(t('qrcode.approved'));
            fetchQrcodes();
        } catch {
            Message.error(t('common.operationFailed'));
        }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        try {
            await request.put(`/qrcodes/${rejectId}/reject`, { reason: rejectReason });
            Message.success(t('qrcode.rejected'));
            setRejectVisible(false);
            setRejectReason('');
            fetchQrcodes();
        } catch {
            Message.error(t('common.operationFailed'));
        }
    };

    const handlePublish = async (id: number) => {
        try {
            await request.put(`/qrcodes/${id}/publish`);
            Message.success(t('qrcode.publishSuccess'));
            fetchQrcodes();
        } catch {
            Message.error(t('common.operationFailed'));
        }
    };

    const openCreate = async () => {
        try {
            const res = await request.get('/articles', { params: { page: 1, page_size: 100, status: 1 } });
            setArticles(res.data.data.list || []);
            setCreateVisible(true);
        } catch {
            Message.error(t('article.fetchFailed'));
        }
    };

    const columns = [
        { title: t('common.id'), dataIndex: 'id', width: 60 },
        { title: t('qrcode.articleTitle'), dataIndex: 'article_title', width: 200 },
        {
            title: t('article.qrcode'),
            width: 80,
            render: (_: unknown, record: QRCode) => (
                <QRCodeSVG
                    value={record.target_url}
                    size={40}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setPreviewQr(record); setPreviewVisible(true); }}
                />
            ),
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            width: 100,
            render: (s: string) => {
                const info = statusMap[s];
                return info ? <Tag color={info.color}>{t(info.key)}</Tag> : s;
            },
        },
        { title: t('qrcode.creator'), dataIndex: 'creator_name', width: 100 },
        { title: t('qrcode.reviewer'), dataIndex: 'reviewer_name', width: 100, render: (v: string) => v || '-' },
        {
            title: t('qrcode.rejectReason'),
            dataIndex: 'reject_reason',
            width: 150,
            render: (v: string) => v || '-',
        },
        { title: t('common.createdAt'), dataIndex: 'created_at', width: 160, render: (v: string) => formatDate(v) },
        {
            title: t('common.operation'),
            width: 200,
            render: (_: unknown, record: QRCode) => (
                <Space>
                    {record.status === QRCODE_STATUS.PENDING && hasPermission('qrcode', 'update') && (
                        <>
                            <Button type="text" size="small" status="success" onClick={() => handleApprove(record.id)}>
                                {t('qrcode.approve')}
                            </Button>
                            <Button
                                type="text"
                                size="small"
                                status="danger"
                                onClick={() => { setRejectId(record.id); setRejectVisible(true); }}
                            >
                                {t('qrcode.reject')}
                            </Button>
                        </>
                    )}
                    {record.status === QRCODE_STATUS.APPROVED && hasPermission('qrcode', 'update') && (
                        <Button type="text" size="small" status="success" onClick={() => handlePublish(record.id)}>
                            {t('qrcode.publishAction')}
                        </Button>
                    )}
                    {record.status === QRCODE_STATUS.REJECTED && (
                        <Popconfirm
                            title={t('qrcode.resubmitHint')}
                            onOk={async () => {
                                await request.put(`/qrcodes/${record.id}/resubmit`);
                                Message.success(t('qrcode.resubmitted'));
                                fetchQrcodes();
                            }}
                        >
                            <Button type="text" size="small">{t('qrcode.resubmit')}</Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Space>
                        <Title heading={5} style={{ margin: 0 }}>{t('qrcode.title')}</Title>
                        <Select
                            placeholder={t('qrcode.statusFilter')}
                            allowClear
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: 120 }}
                        >
                            {Object.entries(statusMap).map(([k, v]) => (
                                <Select.Option key={k} value={k}>{t(v.key)}</Select.Option>
                            ))}
                        </Select>
                    </Space>
                    {hasPermission('qrcode', 'create') && (
                        <Button type="primary" icon={<IconPlus />} onClick={openCreate}>{t('qrcode.create')}</Button>
                    )}
                </div>
                <Table columns={columns} data={qrcodes} loading={loading} rowKey="id" pagination={false} />
            </Card>

            <Modal
                title={t('qrcode.preview')}
                visible={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                style={{ width: 400 }}
            >
                {previewQr && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <QRCodeSVG value={previewQr.target_url} size={240} />
                        <p style={{ marginTop: 16, fontSize: 14, fontWeight: 500 }}>{previewQr.article_title}</p>
                        <p style={{ color: '#666', fontSize: 12, wordBreak: 'break-all' }}>{previewQr.target_url}</p>
                        {statusMap[previewQr.status] && (
                            <Tag color={statusMap[previewQr.status]!.color}>{t(statusMap[previewQr.status]!.key)}</Tag>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                title={t('qrcode.rejectReason')}
                visible={rejectVisible}
                onCancel={() => { setRejectVisible(false); setRejectReason(''); }}
                onOk={handleReject}
            >
                <Input.TextArea
                    placeholder={t('qrcode.rejectReasonPlaceholder')}
                    value={rejectReason}
                    onChange={setRejectReason}
                    rows={3}
                />
            </Modal>

            <Modal
                title={t('qrcode.create')}
                visible={createVisible}
                onCancel={() => setCreateVisible(false)}
                onOk={handleCreate}
            >
                <p style={{ marginBottom: 12 }}>{t('qrcode.createHint')}</p>
                <Select
                    placeholder={t('qrcode.selectArticle')}
                    value={selectedArticleId}
                    onChange={setSelectedArticleId}
                    style={{ width: '100%' }}
                    showSearch
                >
                    {articles.map((a) => (
                        <Select.Option key={a.id} value={a.id}>{a.title}</Select.Option>
                    ))}
                </Select>
            </Modal>
        </div>
    );
}
