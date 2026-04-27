import { Avatar, Button, Dropdown, Layout, Menu, Message } from '@arco-design/web-react';
import {
    IconDashboard,
    IconFile,
    IconFolder,
    IconImage,
    IconLanguage,
    IconLock,
    IconPoweroff,
    IconQrcode,
    IconSettings,
    IconTag,
    IconUser,
} from '@arco-design/web-react/icon';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { request } from '@blog/shared';
import styles from '../styles/admin-layout.module.css';
import { useAuthStore } from '../store/authStore';
import { useLocale } from '../locales';

const { Sider, Header, Content, Footer } = Layout;
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [siteName, setSiteName] = useState('Blog Admin');
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { t, locale, setLocale } = useLocale();

    useEffect(() => {
        request.get('/settings/public').then((res) => {
            const data = res.data.data;
            if (data.logo_url) setLogoUrl(data.logo_url);
            if (data.site_name) setSiteName(data.site_name);
        }).catch(() => { /* ignore */ });
    }, []);

    const handleLogout = () => {
        logout();
        Message.success(t('header.logoutSuccess'));
        navigate('/login');
    };

    const mainMenuItems = [
        { key: '/dashboard', icon: <IconDashboard />, label: t('menu.dashboard') },
        { key: '/articles', icon: <IconFile />, label: t('menu.articles') },
        { key: '/categories', icon: <IconFolder />, label: t('menu.categories') },
        { key: '/tags', icon: <IconTag />, label: t('menu.tags') },
        { key: '/media', icon: <IconImage />, label: t('menu.media') },
        { key: '/qrcode', icon: <IconQrcode />, label: t('menu.qrcode') },
    ];

    const sysMenuItems = [
        { key: '/roles', icon: <IconLock />, label: t('menu.roles') },
        { key: '/users', icon: <IconUser />, label: t('menu.users') },
        { key: '/settings', icon: <IconSettings />, label: t('menu.settings') },
    ];

    const userDropList = (
        <Menu onClickMenuItem={(key) => {
            if (key === 'logout') handleLogout();
            if (key === 'profile') navigate('/profile');
        }}>
            <MenuItem key="profile"><IconUser /> {t('header.profile')}</MenuItem>
            <MenuItem key="logout"><IconPoweroff /> {t('header.logout')}</MenuItem>
        </Menu>
    );

    const langDropList = (
        <Menu onClickMenuItem={(key) => setLocale(key as 'zh-CN' | 'en-US')}>
            <MenuItem key="zh-CN">中文</MenuItem>
            <MenuItem key="en-US">English</MenuItem>
        </Menu>
    );

    return (
        <Layout style={{ height: '100vh' }}>
            <Sider
                collapsed={collapsed}
                onCollapse={setCollapsed}
                collapsible
                breakpoint="lg"
                style={{ overflow: 'auto' }}
            >
                <div className={styles.sidebarLogo}>
                    {logoUrl ? <img src={logoUrl} alt="Logo" /> : null}
                    {!collapsed && <span>{siteName}</span>}
                    {collapsed && !logoUrl && <span className="text-xl">B</span>}
                </div>
                <Menu
                    selectedKeys={[location.pathname]}
                    onClickMenuItem={(key) => navigate(key)}
                    style={{ width: '100%' }}
                    theme="dark"
                >
                    {mainMenuItems.map((item) => (
                        <MenuItem key={item.key}>
                            {item.icon}
                            {item.label}
                        </MenuItem>
                    ))}
                    <SubMenu
                        key="system"
                        title={<span><IconLock /> {t('menu.system')}</span>}
                    >
                        {sysMenuItems.map((item) => (
                            <MenuItem key={item.key}>
                                {item.icon}
                                {item.label}
                            </MenuItem>
                        ))}
                    </SubMenu>
                </Menu>
            </Sider>
            <Layout>
                <Header className="flex justify-end items-center px-5 h-12 gap-3 shadow-sm bg-[var(--color-bg-2)]">
                    <Dropdown droplist={langDropList} position="br">
                        <Button
                            type="text"
                            icon={<IconLanguage />}
                            className="text-[var(--color-text-2)]"
                        >
                            {locale === 'zh-CN' ? '中文' : 'EN'}
                        </Button>
                    </Dropdown>
                    <Dropdown droplist={userDropList} position="br">
                        <div className="flex items-center cursor-pointer gap-2">
                            <Avatar size={28} className="bg-admin-primary">
                                {user?.username?.[0]?.toUpperCase() || 'A'}
                            </Avatar>
                            <span>{user?.username || t('header.admin')}</span>
                        </div>
                    </Dropdown>
                </Header>
                <Content className="p-5 overflow-auto bg-[var(--color-fill-2)]">
                    <Outlet />
                </Content>
                <Footer className="text-center py-3 text-xs text-[var(--color-text-3)]">
                    Blog Admin &copy; 2024
                </Footer>
            </Layout>
        </Layout>
    );
}
