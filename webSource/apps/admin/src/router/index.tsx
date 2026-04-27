import { Navigate, createBrowserRouter } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import ArticleEditor from '../pages/articles/Editor';
import ArticleList from '../pages/articles/List';
import AuthGuard from '../components/AuthGuard';
import CategoryList from '../pages/categories/List';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import MediaLibrary from '../pages/media/Library';
import QRCodeManage from '../pages/qrcode/Manage';
import RoleList from '../pages/roles/List';
import Settings from '../pages/settings/Settings';
import TagList from '../pages/tags/List';
import UserList from '../pages/users/List';

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/',
        element: (
            <AuthGuard>
                <AdminLayout />
            </AuthGuard>
        ),
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'articles', element: <ArticleList /> },
            { path: 'articles/create', element: <ArticleEditor /> },
            { path: 'articles/edit/:id', element: <ArticleEditor /> },
            { path: 'categories', element: <CategoryList /> },
            { path: 'tags', element: <TagList /> },
            { path: 'media', element: <MediaLibrary /> },
            { path: 'qrcode', element: <QRCodeManage /> },
            { path: 'roles', element: <RoleList /> },
            { path: 'users', element: <UserList /> },
            { path: 'settings', element: <Settings /> },
        ],
    },
]);

export default router;
