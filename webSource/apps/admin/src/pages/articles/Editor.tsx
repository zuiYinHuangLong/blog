import { useState, useEffect } from 'react';
import {
    Form, Input, Button, Card, Select, TreeSelect, Space, Message, Radio, Grid, Typography,
} from '@arco-design/web-react';
import { useNavigate, useParams } from 'react-router-dom';
import { request } from '@blog/shared';
import type { Category, Tag } from '@blog/shared';
import { useLocale } from '../../locales';
import { buildCategoryTree, type CategoryTreeNode } from '../../utils/categoryTree';

const { Row, Col } = Grid;
const { TextArea } = Input;

export default function ArticleEditor() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [contentType, setContentType] = useState<'markdown' | 'richtext'>('markdown');
    const { t } = useLocale();

    useEffect(() => {
        Promise.all([
            request.get('/categories').then((r) => {
                const list: Category[] = r.data.data.list || r.data.data || [];
                setCategoryTree(buildCategoryTree(list));
            }),
            request.get('/tags').then((r) => setTags(r.data.data.list || r.data.data || [])),
        ]).catch(() => { });

        if (isEdit) {
            request.get(`/articles/${id}`).then((res) => {
                const article = res.data.data;
                form.setFieldsValue({
                    title: article.title,
                    slug: article.slug,
                    summary: article.summary,
                    content: article.content,
                    category_id: article.category_id,
                    tag_ids: article.tags?.map((tg: Tag) => tg.id) || [],
                    cover_image: article.cover_image,
                });
                setContentType(article.content_type || 'markdown');
            }).catch(() => Message.error(t('article.fetchDetailFailed')));
        }
    }, [id, isEdit, form, t]);

    const handleSubmit = async () => {
        try {
            const values = await form.validate();
            setLoading(true);
            const payload = { ...values, content_type: contentType };

            if (isEdit) {
                await request.put(`/articles/${id}`, payload);
                Message.success(t('common.updateSuccess'));
            } else {
                await request.post('/articles', payload);
                Message.success(t('common.createSuccess'));
            }
            navigate('/articles');
        } catch {
            // validation error or API error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Card title={<Typography.Title heading={5} style={{ margin: 0 }}>{isEdit ? t('article.editArticle') : t('article.createArticle')}</Typography.Title>}>
                <Form form={form} layout="vertical" style={{ maxWidth: 900 }}>
                    <Row gutter={20}>
                        <Col span={16}>
                            <Form.Item field="title" label={t('article.articleTitle')} rules={[{ required: true, message: t('article.titleRequired') }]}>
                                <Input placeholder={t('article.titlePlaceholder')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item field="slug" label={t('article.slugLabel')}>
                                <Input placeholder={t('article.slugPlaceholder')} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item field="summary" label={t('article.summary')}>
                        <TextArea placeholder={t('article.summaryPlaceholder')} rows={2} />
                    </Form.Item>

                    <Form.Item label={t('article.editMode')}>
                        <Radio.Group value={contentType} onChange={setContentType}>
                            <Radio value="markdown">{t('article.markdown')}</Radio>
                            <Radio value="richtext">{t('article.richtext')}</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item field="content" label={t('article.content')} rules={[{ required: true, message: t('article.contentRequired') }]}>
                        <TextArea
                            placeholder={contentType === 'markdown' ? t('article.markdownPlaceholder') : t('article.richtextPlaceholder')}
                            rows={16}
                            style={{ fontFamily: contentType === 'markdown' ? 'monospace' : 'inherit' }}
                        />
                    </Form.Item>

                    <Row gutter={20}>
                        <Col span={8}>
                            <Form.Item field="category_id" label={t('article.category')}>
                                <TreeSelect
                                    treeData={categoryTree}
                                    fieldNames={{ key: 'id', title: 'name', children: 'children' }}
                                    placeholder={t('article.selectCategory')}
                                    allowClear
                                    showSearch
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item field="tag_ids" label={t('article.tags')}>
                                <Select mode="multiple" placeholder={t('article.selectTags')} allowClear>
                                    {tags.map((tg) => (
                                        <Select.Option key={tg.id} value={tg.id}>{tg.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item field="cover_image" label={t('article.coverImage')}>
                                <Input placeholder={t('article.coverImagePlaceholder')} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space>
                            <Button type="primary" loading={loading} onClick={handleSubmit}>
                                {isEdit ? t('common.save') : t('common.create')}
                            </Button>
                            <Button onClick={() => navigate('/articles')}>{t('common.cancel')}</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
