import { useState, useEffect, useCallback } from 'react';
import {
    Tree, TreeSelect, Button, Card, Space, Modal, Form, Input, Message,
    Popconfirm, InputNumber, Typography, Tooltip,
} from '@arco-design/web-react';
import { IconPlus, IconEdit, IconDelete, IconPlusCircle } from '@arco-design/web-react/icon';
import { request } from '@blog/shared';
import type { Category } from '@blog/shared';
import { useLocale } from '../../locales';
import { buildCategoryTree, getAllKeys, collectAllIds, type CategoryTreeNode } from '../../utils/categoryTree';
import styles from '../../styles/category-tree.module.css';

export default function CategoryList() {
    const { t } = useLocale();
    const [categories, setCategories] = useState<Category[]>([]);
    const [treeData, setTreeData] = useState<CategoryTreeNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [form] = Form.useForm();

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await request.get('/categories');
            const list: Category[] = res.data.data.list || res.data.data || [];
            setCategories(list);
            const tree = buildCategoryTree(list);
            setTreeData(tree);
            setExpandedKeys(getAllKeys(tree));
        } catch {
            Message.error(t('category.fetchFailed'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const openCreate = (parentId?: number) => {
        setEditingId(null);
        form.resetFields();
        if (parentId) {
            form.setFieldValue('parent_id', parentId);
        }
        setModalVisible(true);
    };

    const openEdit = (cat: Category) => {
        setEditingId(cat.id);
        form.setFieldsValue({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            sort: cat.sort,
            parent_id: cat.parent_id || undefined,
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validate();
            const payload = { ...values, parent_id: values.parent_id || null };
            if (editingId) {
                await request.put(`/categories/${editingId}`, payload);
                Message.success(t('common.updateSuccess'));
            } else {
                await request.post('/categories', payload);
                Message.success(t('common.createSuccess'));
            }
            setModalVisible(false);
            fetchCategories();
        } catch { /* validation */ }
    };

    const handleDelete = async (id: number) => {
        try {
            await request.delete(`/categories/${id}`);
            Message.success(t('common.deleteSuccess'));
            fetchCategories();
        } catch {
            Message.error(t('category.deleteHasArticles'));
        }
    };

    const getDisabledKeys = (): Set<number> => {
        if (!editingId) return new Set();
        const node = findNode(treeData, editingId);
        if (!node) return new Set();
        return new Set(collectAllIds(node));
    };

    const findNode = (nodes: CategoryTreeNode[], id: number): CategoryTreeNode | null => {
        for (const n of nodes) {
            if (n.id === id) return n;
            const found = findNode(n.children, id);
            if (found) return found;
        }
        return null;
    };

    const buildSelectData = (nodes: CategoryTreeNode[], disabledIds: Set<number>): CategoryTreeNode[] => {
        return nodes.map((n) => ({
            ...n,
            disabled: disabledIds.has(n.id),
            children: buildSelectData(n.children, disabledIds),
        })) as CategoryTreeNode[];
    };

    const handleExpandAll = () => setExpandedKeys(getAllKeys(treeData));
    const handleCollapseAll = () => setExpandedKeys([]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Typography.Title heading={4}>{t('category.title')}</Typography.Title>
                <Space>
                    <Button size="small" onClick={handleExpandAll}>{t('category.expandAll')}</Button>
                    <Button size="small" onClick={handleCollapseAll}>{t('category.collapseAll')}</Button>
                    <Button type="primary" icon={<IconPlus />} onClick={() => openCreate()}>
                        {t('category.create')}
                    </Button>
                </Space>
            </div>
            <Card loading={loading}>
                {treeData.length > 0 ? (
                    <div className={styles.treeContainer}>
                        <Tree
                            treeData={treeData}
                            fieldNames={{ key: 'id', title: 'name', children: 'children' }}
                            showLine
                            blockNode
                            expandedKeys={expandedKeys}
                            onExpand={(keys) => setExpandedKeys(keys as string[])}
                            renderExtra={(node) => {
                                const cat = categories.find((c) => String(c.id) === String(node._key));
                                if (!cat) return null;
                                return (
                                    <span className={styles.nodeActions}>
                                        <Tooltip content={t('common.edit')}>
                                            <Button
                                                type="text"
                                                size="mini"
                                                icon={<IconEdit />}
                                                onClick={(e) => { e.stopPropagation(); openEdit(cat); }}
                                            />
                                        </Tooltip>
                                        <Tooltip content={t('category.addChild')}>
                                            <Button
                                                type="text"
                                                size="mini"
                                                icon={<IconPlusCircle />}
                                                onClick={(e) => { e.stopPropagation(); openCreate(cat.id); }}
                                            />
                                        </Tooltip>
                                        <Popconfirm
                                            title={t('common.confirmDelete')}
                                            onOk={() => handleDelete(cat.id)}
                                        >
                                            <Tooltip content={t('common.delete')}>
                                                <Button
                                                    type="text"
                                                    size="mini"
                                                    status="danger"
                                                    icon={<IconDelete />}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </Tooltip>
                                        </Popconfirm>
                                    </span>
                                );
                            }}
                        />
                    </div>
                ) : (
                    !loading && <div className="text-center py-10 text-[var(--color-text-3)]">{t('common.noData')}</div>
                )}
            </Card>

            <Modal
                title={editingId ? t('category.edit') : t('category.create')}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                unmountOnExit
            >
                <Form form={form} layout="vertical">
                    <Form.Item field="name" label={t('common.name')} rules={[{ required: true, message: t('category.nameRequired') }]}>
                        <Input placeholder={t('category.namePlaceholder')} />
                    </Form.Item>
                    <Form.Item field="slug" label={t('common.slug')} rules={[{ required: true, message: t('category.slugRequired') }]}>
                        <Input placeholder={t('category.slugPlaceholder')} />
                    </Form.Item>
                    <Form.Item field="parent_id" label={t('category.parentCategory')}>
                        <TreeSelect
                            treeData={buildSelectData(treeData, getDisabledKeys())}
                            fieldNames={{ key: 'id', title: 'name', children: 'children' }}
                            placeholder={t('category.parentPlaceholder')}
                            allowClear
                            showSearch
                        />
                    </Form.Item>
                    <Form.Item field="description" label={t('common.description')}>
                        <Input placeholder={t('category.descriptionPlaceholder')} />
                    </Form.Item>
                    <Form.Item field="sort" label={t('common.sort')}>
                        <InputNumber placeholder={t('category.sortPlaceholder')} defaultValue={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
