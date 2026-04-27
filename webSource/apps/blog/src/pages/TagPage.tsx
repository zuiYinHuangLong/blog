import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import type { Article } from '@blog/shared';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { request } from '@blog/shared';

export default function TagPage() {
    const { slug } = useParams();
    const [articles, setArticles] = useState<Article[]>([]);
    const [total, setTotal] = useState(0);
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;

    useEffect(() => {
        request.get('/public/articles', { params: { tag: slug, page, page_size: 10 } })
            .then((res) => {
                setArticles(res.data.data.list || []);
                setTotal(res.data.data.total || 0);
            }).catch(() => { });
    }, [slug, page]);

    return (
        <div>
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>
                标签: <span style={{ color: '#3370ff' }}>#{slug}</span>
            </h2>
            {articles.length === 0 ? (
                <p style={{ color: '#999' }}>该标签下暂无文章</p>
            ) : (
                articles.map((a) => <ArticleCard key={a.id} article={a} />)
            )}
            <Pagination current={page} total={total} pageSize={10} basePath={`/tag/${slug}`} />
        </div>
    );
}
