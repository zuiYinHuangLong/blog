import { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Card, Space, Modal, Form, Input, Message, Popconfirm, Typography,
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { request, formatDate } from '@blog/shared';
import type { Tag } from '@blog/shared';
import { useLocale } from '../../locales';

const { Title } = Typography;

export default function TagList() {
    const { t } = useLocale();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const fetchTags = useCallback(async () => {
        setLoading(true);
        try {
            const res = await request.get('/tags');
            setTags(res.data.data.list || res.data.data || []);
        } catch {
            Message.error(t('tag.fetchFailed'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchTags(); }, [fetchTags]);

    const openModal = (record?: Tag) => {
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue({ name: record.name, slug: record.slug });
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validate();
            if (editingId) {
                await request.put(`/tags/${editingId}`, values);
                Message.success(t('common.updateSuccess'));
            } else {
                await request.post('/tags', values);
                Message.success(t('common.createSuccess'));
            }
            setModalVisible(false);
            fetchTags();
        } catch { /* validation */ }
    };

    const handleDelete = async (id: number) => {
        try {
            await request.delete(`/tags/${id}`);
            Message.success(t('common.deleteSuccess'));
            fetchTags();
        } catch {
            Message.error(t('common.deleteFailed'));
        }
    };

    const columns = [
        { title: t('common.id'), dataIndex: 'id', width: 60 },
        { title: t('common.name'), dataIndex: 'name', width: 150 },
        { title: t('common.slug'), dataIndex: 'slug', width: 150 },
        { title: t('tag.articleCount'), dataIndex: 'article_count', width: 80 },
        { title: t('common.createdAt'), dataIndex: 'created_at', width: 160, render: (v: string) => formatDate(v) },
        {
            title: t('common.operation'),
            width: 150,
            render: (_: unknown, record: Tag) => (
                <Space>
                    <Button type="text" size="small" onClick={() => openModal(record)}>{t('common.edit')}</Button>
                    <Popconfirm title={t('common.confirmDelete')} onOk={() => handleDelete(record.id)}>
                        <Button type="text" size="small" status="danger">{t('common.delete')}</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Title heading={5} style={{ margin: 0 }}>{t('tag.title')}</Title>
                    <Button type="primary" icon={<IconPlus />} onClick={() => openModal()}>{t('tag.create')}</Button>
                </div>
                <Table columns={columns} data={tags} loading={loading} rowKey="id" pagination={false} />
            </Card>

            <Modal
                title={editingId ? t('tag.edit') : t('tag.create')}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item field="name" label={t('common.name')} rules={[{ required: true, message: t('tag.nameRequired') }]}>
                        <Input placeholder={t('tag.namePlaceholder')} />
                    </Form.Item>
                    <Form.Item field="slug" label={t('common.slug')} rules={[{ required: true, message: t('tag.slugRequired') }]}>
                        <Input placeholder={t('tag.slugPlaceholder')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
