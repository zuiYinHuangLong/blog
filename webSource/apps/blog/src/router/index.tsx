import About from '../pages/About';
import ArticleDetail from '../pages/ArticleDetail';
import BlogLayout from '../layouts/BlogLayout';
import CategoryPage from '../pages/CategoryPage';
import Home from '../pages/Home';
import TagPage from '../pages/TagPage';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        element: <BlogLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'article/:slug', element: <ArticleDetail /> },
            { path: 'category/:id', element: <CategoryPage /> },
            { path: 'tag/:slug', element: <TagPage /> },
            { path: 'about', element: <About /> },
        ],
    },
]);

export default router;
