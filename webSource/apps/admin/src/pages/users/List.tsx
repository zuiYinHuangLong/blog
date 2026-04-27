import {
    Button,
    Card,
    Form,
    Input,
    Message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from '@arco-design/web-react';
import { request, rsaEncrypt } from '@blog/shared';
import { useEffect, useState } from 'react';

import { IconPlus } from '@arco-design/web-react/icon';
import { useAuthStore } from '../../store/authStore';
import { useLocale } from '../../locales';

const { Title } = Typography;

interface UserItem {
    id: number;
    username: string;
    email: string;
    role_id: number;
    role?: { id: number; name: string };
    status: number;
    created_at: string;
}

interface RoleItem {
    id: number;
    name: string;
}

export default function UserList() {
    const { t } = useLocale();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [form] = Form.useForm();
    const { hasPermission } = useAuthStore();

    const fetchUsers = async (p = page) => {
        setLoading(true);
        try {
            const res = await request.get('/users', { params: { page: p, page_size: 20 } });
            setUsers(res.data.data.list || []);
            setTotal(res.data.data.total || 0);
        } catch {
            Message.error(t('user.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await request.get('/roles');
            console.log(res.data.data, '===roles');
            setRoles(res.data.data?.list || []);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleCreate = () => {
        setEditingUser(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record: UserItem) => {
        setEditingUser(record);
        form.setFieldsValue({
            email: record.email,
            role_id: record.role_id,
            status: record.status,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await request.delete(`/users/${id}`);
            Message.success(t('common.deleteSuccess'));
            fetchUsers();
        } catch {
            Message.error(t('common.deleteFailed'));
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validate();
            if (editingUser) {
                const payload: Record<string, unknown> = {
                    email: values.email,
                    role_id: values.role_id,
                    status: values.status,
                };
                if (values.password) {
                    payload.password = await rsaEncrypt(values.password);
                }
                await request.put(`/users/${editingUser.id}`, payload);
                Message.success(t('common.updateSuccess'));
            } else {
                const encrypted = await rsaEncrypt(values.password);
                await request.post('/users', {
                    username: values.username,
                    email: values.email,
                    password: encrypted,
                    role_id: values.role_id,
                });
                Message.success(t('common.createSuccess'));
            }
            setModalVisible(false);
            fetchUsers();
        } catch {
            Message.error(t('common.operationFailed'));
        }
    };

    const columns = [
        { title: t('common.id'), dataIndex: 'id', width: 60 },
        { title: t('user.username'), dataIndex: 'username' },
        { title: t('user.email'), dataIndex: 'email' },
        {
            title: t('user.role'),
            dataIndex: 'role',
            render: (_: unknown, record: UserItem) => record.role?.name || '-',
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            render: (status: number) =>
                status === 1
                    ? <Tag color="green">{t('user.statusActive')}</Tag>
                    : <Tag color="red">{t('user.statusDisabled')}</Tag>,
        },
        { title: t('common.createdAt'), dataIndex: 'created_at', render: (v: string) => v?.slice(0, 10) },
        {
            title: t('common.operation'),
            render: (_: unknown, record: UserItem) => (
                <Space>
                    {hasPermission('user', 'update') && (
                        <Button size="small" type="text" onClick={() => handleEdit(record)}>
                            {t('common.edit')}
                        </Button>
                    )}
                    {hasPermission('user', 'delete') && (
                        <Popconfirm title={t('user.confirmDelete')} onOk={() => handleDelete(record.id)}>
                            <Button size="small" type="text" status="danger">{t('common.delete')}</Button>
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
                    <Title heading={5} style={{ margin: 0 }}>{t('user.title')}</Title>
                    {hasPermission('user', 'create') && (
                        <Button type="primary" icon={<IconPlus />} onClick={handleCreate}>
                            {t('user.create')}
                        </Button>
                    )}
                </div>

                <Table
                    columns={columns}
                    data={users}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        total,
                        current: page,
                        pageSize: 20,
                        onChange: (p) => { setPage(p); fetchUsers(p); },
                    }}
                />
            </Card>

            <Modal
                title={editingUser ? t('user.edit') : t('user.create')}
                visible={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                autoFocus={false}
                focusLock
            >
                <Form form={form} layout="vertical">
                    {!editingUser && (
                        <Form.Item field="username" label={t('user.username')} rules={[{ required: true, message: t('user.usernameRequired') }]}>
                            <Input placeholder={t('user.usernamePlaceholder')} />
                        </Form.Item>
                    )}
                    <Form.Item
                        field="email"
                        label={t('user.email')}
                        rules={[
                            { required: !editingUser, message: t('user.emailRequired') },
                            { type: 'email', message: t('user.emailInvalid') },
                        ]}
                    >
                        <Input placeholder={t('user.emailPlaceholder')} />
                    </Form.Item>
                    <Form.Item
                        field="password"
                        label={editingUser ? t('user.passwordEditLabel') : t('user.password')}
                        rules={editingUser ? [] : [{ required: true, message: t('user.passwordRequired') }]}
                    >
                        <Input.Password placeholder={t('user.passwordPlaceholder')} />
                    </Form.Item>
                    <Form.Item field="role_id" label={t('user.role')} rules={[{ required: true, message: t('user.roleRequired') }]}>
                        <Select placeholder={t('user.rolePlaceholder')}>
                            {roles?.map((r) => (
                                <Select.Option key={r?.id} value={r?.id}>{r?.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {editingUser && (
                        <Form.Item field="status" label={t('common.status')}>
                            <Select>
                                <Select.Option value={1}>{t('user.statusActive')}</Select.Option>
                                <Select.Option value={0}>{t('user.statusDisabled')}</Select.Option>
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
