import { Link, Outlet } from 'react-router-dom';

export default function BlogLayout() {
    return (
        <div>
            <header style={{
                background: '#fff',
                borderBottom: '1px solid #e8e8e8',
                padding: '12px 0',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ fontSize: 22, fontWeight: 700, color: '#333' }}>Blog</Link>
                    <nav style={{ display: 'flex', gap: 20 }}>
                        <Link to="/">首页</Link>
                        <Link to="/categories">分类</Link>
                        <Link to="/tags">标签</Link>
                        <Link to="/about">关于</Link>
                    </nav>
                </div>
            </header>

            <main className="container" style={{ display: 'flex', gap: 24, padding: '24px 20px', minHeight: 'calc(100vh - 120px)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Outlet />
                </div>
                <aside style={{ width: 280, flexShrink: 0 }} id="blog-sidebar" />
            </main>

            <footer style={{
                background: '#fff',
                borderTop: '1px solid #e8e8e8',
                padding: '16px 0',
                textAlign: 'center',
                fontSize: 13,
                color: '#999',
            }}>
                <div className="container">
                    &copy; {new Date().getFullYear()} Blog. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
