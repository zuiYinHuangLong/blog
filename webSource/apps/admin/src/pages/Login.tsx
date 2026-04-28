import { Button, Card, Form, Input, Message } from '@arco-design/web-react';
import { IconLock, IconSafe, IconUser } from '@arco-design/web-react/icon';
import { loginApi, useAuthStore } from '../store/authStore';
import { useCallback, useEffect, useState } from 'react';

import { request } from '@blog/shared';
import styles from '../styles/login.module.css';
import { useLocale } from '../locales';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [captchaEnabled, setCaptchaEnabled] = useState(false);
    const [captchaId, setCaptchaId] = useState('');
    const [captchaImage, setCaptchaImage] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const { t } = useLocale();

    const loadSettings = async () => {
        try {
            const res = await request.get('/settings/public');
            const data = res.data.data;
            setCaptchaEnabled(data.captcha_enabled === 'true');
            if (data.logo_url) setLogoUrl(data.logo_url);
        } catch { /* ignore */ }
    };

    const loadCaptcha = useCallback(async () => {
        try {
            const res = await request.get('/auth/captcha');
            setCaptchaId(res.data.data.captcha_id);
            setCaptchaImage(res.data.data.captcha_image);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { loadSettings(); }, []);

    useEffect(() => {
        if (captchaEnabled) loadCaptcha();
    }, [captchaEnabled, loadCaptcha]);

    const handleLogin = async (values: { username: string; password: string; captcha?: string }) => {
        setLoading(true);
        try {
            const data = await loginApi(values.username, values.password, captchaId, values.captcha);
            setAuth(data.user, data.access_token, data.permissions || []);
            Message.success(t('login.success'));
            navigate('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('login.failed');
            Message.error(message);
            if (captchaEnabled) loadCaptcha();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginBg}>
            <Card className={styles.loginCard} bordered={false}>
                <div className="text-center mb-8 pt-2">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="max-h-13 max-w-[200px] mb-2" />
                    ) : (
                        <div className={styles.logoBox}>B</div>
                    )}
                    <h2 className="mt-2 mb-0 text-[22px] font-semibold text-[var(--color-text-1)]">{t('login.title')}</h2>
                </div>
                <Form onSubmit={handleLogin} wrapperCol={{ span: 24 }} autoComplete="off" size="large">
                    <Form.Item field="username" rules={[{ required: true, message: t('login.usernameRequired') }]}>
                        <Input prefix={<IconUser />} placeholder={t('login.usernamePlaceholder')} />
                    </Form.Item>
                    <Form.Item field="password" rules={[{ required: true, message: t('login.passwordRequired') }]}>
                        <Input.Password prefix={<IconLock />} placeholder={t('login.passwordPlaceholder')} />
                    </Form.Item>
                    {captchaEnabled && (
                        <>
                            <div style={{ width: '100%' }} className='flex' >
                                <Form.Item style={{ width: '100%' }} className="mb-0" field="captcha" rules={[{ required: true, message: t('login.captchaRequired') }]}>
                                    <Input
                                        className="rounded-r-none"
                                        prefix={<IconSafe />}
                                        placeholder={t('login.captchaPlaceholder')}
                                    />
                                </Form.Item>
                                <a href='javascritp:;'
                                    className="block ml-1 h-9 cursor-pointer rounded-sm overflow-hidden"
                                    onClick={loadCaptcha}
                                >
                                    <img
                                        src={captchaImage}
                                        alt={t('login.captcha')}
                                        className="h-full border-[var(--color-border)]"
                                        title={t('login.captchaRefresh')}
                                    />
                                </a>
                            </div>
                        </>
                    )}
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" long loading={loading} className="h-11 rounded-lg text-base">
                            {t('login.submit')}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
