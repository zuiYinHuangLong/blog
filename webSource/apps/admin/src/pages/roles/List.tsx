import {
    Button,
    Card,
    Form,
    Input,
    Message,
    Modal,
    Popconfirm,
    Space,
    Table,
    Tag,
    Typography,
} from '@arco-design/web-react';
import { PERMISSION_ACTIONS, PERMISSION_MODULES, formatDate, request } from '@blog/shared';
import type { Permission, Role } from '@blog/shared';
import { useCallback, useEffect, useState } from 'react';

import { IconPlus } from '@arco-design/web-react/icon';
import { useLocale } from '../../locales';

const { Title } = Typography;

export default function RoleList() {
    const { t } = useLocale();
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
    const [form] = Form.useForm();

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await request.get('/roles');
            setRoles(res.data.data.list || res.data.data || []);
        } catch {
            Message.error(t('role.fetchFailed'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    const fetchPermissions = useCallback(async () => {
        try {
            const res = await request.get('/permissions');
            setAllPermissions(res.data.data || []);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { fetchRoles(); fetchPermissions(); }, [fetchRoles, fetchPermissions]);

    const openModal = (record?: Role) => {
        if (record) {
            setEditingRole(record);
            form.setFieldsValue({ name: record.name, description: record.description });
            setSelectedPermIds(record.permissions?.map((p) => String(p.id)) || []);
        } else {
            setEditingRole(null);
            form.resetFields();
            setSelectedPermIds([]);
        }
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validate();
            const payload = {
                ...values,
                permission_ids: selectedPermIds.map(Number),
            };
            if (editingRole) {
                await request.put(`/roles/${editingRole.id}`, payload);
                Message.success(t('common.updateSuccess'));
            } else {
                await request.post('/roles', payload);
                Message.success(t('common.createSuccess'));
            }
            setModalVisible(false);
            fetchRoles();
        } catch { /* validation */ }
    };

    const handleDelete = async (id: number) => {
        try {
            await request.delete(`/roles/${id}`);
            Message.success(t('common.deleteSuccess'));
            fetchRoles();
        } catch {
            Message.error(t('role.deleteFailedHasUsers'));
        }
    };

    const columns = [
        { title: t('common.id'), dataIndex: 'id', width: 60 },
        { title: t('role.name'), dataIndex: 'name', width: 120 },
        { title: t('common.description'), dataIndex: 'description', width: 200 },
        {
            title: t('role.permissionCount'),
            width: 80,
            render: (_: unknown, record: Role) => (
                <Tag color="blue">{record.permissions?.length || 0}</Tag>
            ),
        },
        { title: t('common.createdAt'), dataIndex: 'created_at', width: 160, render: (v: string) => formatDate(v) },
        {
            title: t('common.operation'),
            width: 150,
            render: (_: unknown, record: Role) => (
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
                <div className="flex justify-between items-center mb-4">
                    <Title heading={5} style={{ margin: 0 }}>{t('role.title')}</Title>
                    <Button type="primary" icon={<IconPlus />} onClick={() => openModal()}>{t('role.create')}</Button>
                </div>
                <Table columns={columns} data={roles} loading={loading} rowKey="id" pagination={false} />
            </Card>

            <Modal
                title={editingRole ? t('role.edit') : t('role.create')}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                style={{ width: 700 }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item field="name" label={t('role.name')} rules={[{ required: true, message: t('role.nameRequired') }]}>
                        <Input placeholder={t('role.namePlaceholderExample')} />
                    </Form.Item>
                    <Form.Item field="description" label={t('common.description')}>
                        <Input placeholder={t('role.descriptionPlaceholder')} />
                    </Form.Item>
                </Form>
                <div style={{ marginTop: 16 }}>
                    <Title heading={6} style={{ marginBottom: 8 }}>{t('role.permissions')}</Title>
                    <div className="grid grid-cols-4 gap-2">
                        {PERMISSION_MODULES.map((mod) => (
                            <Card key={mod} size="small" title={t(`role.module.${mod}`)} style={{ fontSize: 12 }}>
                                {PERMISSION_ACTIONS.map((act) => {
                                    const perm = allPermissions.find((p) => p.module === mod && p.action === act);
                                    if (!perm) return null;
                                    const checked = selectedPermIds.includes(String(perm.id));
                                    return (
                                        <label key={act} className="block cursor-pointer py-0.5">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {
                                                    setSelectedPermIds((prev) =>
                                                        checked ? prev.filter((id) => id !== String(perm.id)) : [...prev, String(perm.id)],
                                                    );
                                                }}
                                            />
                                            {' '}{t(`role.action.${act}`)}
                                        </label>
                                    );
                                })}
                            </Card>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
