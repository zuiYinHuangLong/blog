import {
    Button,
    Card,
    Form,
    Input,
    Message,
    Space,
    Switch,
    Typography,
    Upload,
} from '@arco-design/web-react';
import { useEffect, useState } from 'react';

import { IconUpload } from '@arco-design/web-react/icon';
import { request } from '@blog/shared';
import { useLocale } from '../../locales';

const { Title } = Typography;

export default function Settings() {
    const { t } = useLocale();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState('');

    const loadSettings = async () => {
        try {
            const res = await request.get('/settings');
            const data = res.data.data;
            form.setFieldsValue({
                captcha_enabled: data.captcha_enabled === 'true',
                logo_url: data.logo_url || '',
                site_name: data.site_name || '',
            });
            setLogoPreview(data.logo_url || '');
        } catch {
            Message.error(t('settings.loadFailed'));
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const values = form.getFieldsValue();
            await request.put('/settings', {
                captcha_enabled: values.captcha_enabled ? 'true' : 'false',
                logo_url: values.logo_url || '',
                site_name: values.site_name || '',
            });
            Message.success(t('settings.saveSuccess'));
        } catch {
            Message.error(t('common.saveFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleUploadLogo = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await request.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const url = res.data.data.url;
            form.setFieldValue('logo_url', url);
            setLogoPreview(url);
            Message.success(t('settings.uploadSuccess'));
        } catch {
            Message.error(t('settings.uploadFailed'));
        }
        return false;
    };

    return (
        <div>
            <Title heading={4} className="mb-5">{t('settings.title')}</Title>
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    className="max-w-[600px]"
                >
                    <Form.Item label={t('settings.siteName')} field="site_name">
                        <Input placeholder={t('settings.siteNamePlaceholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('settings.captchaEnabled')}
                        field="captcha_enabled"
                        triggerPropName="checked"
                    >
                        <Switch checkedText={t('common.enabled')} uncheckedText={t('common.disabled')} />
                    </Form.Item>

                    <Form.Item label={t('settings.logoUrl')} field="logo_url">
                        <Input placeholder={t('settings.logoUrlPlaceholder')} />
                    </Form.Item>

                    <Form.Item label={t('settings.uploadLogo')}>
                        <Space direction="vertical">
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    handleUploadLogo(file);
                                    return false;
                                }}
                            >
                                <Button icon={<IconUpload />}>{t('settings.selectImage')}</Button>
                            </Upload>
                            {logoPreview && (
                                <div className="mt-2 p-2 border border-[var(--color-border)] rounded bg-neutral-100">
                                    <img
                                        src={logoPreview}
                                        alt={t('settings.logoPreview')}
                                        className="max-h-[60px] max-w-[200px]"
                                    />
                                </div>
                            )}
                        </Space>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" loading={loading} onClick={handleSave}>
                            {t('settings.saveSettings')}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
