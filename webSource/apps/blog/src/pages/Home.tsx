import { useEffect, useState } from 'react';

import type { Article } from '@blog/shared';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import { createPortal } from 'react-dom';
import { request } from '@blog/shared';
import { useSearchParams } from 'react-router-dom';

export default function Home() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = 10;

    useEffect(() => {
        setLoading(true);
        request.get('/public/articles', { params: { page, page_size: pageSize } })
            .then((res) => {
                setArticles(res.data.data.list || []);
                setTotal(res.data.data.total || 0);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [page]);

    const sidebarEl = document.getElementById('blog-sidebar');

    return (
        <>
            <div>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</p>
                ) : articles.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无文章</p>
                ) : (
                    articles.map((article) => <ArticleCard key={article.id} article={article} />)
                )}
                <Pagination current={page} total={total} pageSize={pageSize} basePath="/" />
            </div>
            {sidebarEl && createPortal(<Sidebar />, sidebarEl)}
        </>
    );
}
