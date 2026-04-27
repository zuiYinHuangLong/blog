import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import type { Article } from '@blog/shared';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { request } from '@blog/shared';

export default function CategoryPage() {
    const { id } = useParams();
    const [articles, setArticles] = useState<Article[]>([]);
    const [total, setTotal] = useState(0);
    const [categoryName, setCategoryName] = useState('');
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;

    useEffect(() => {
        request.get('/public/articles', { params: { category_id: id, page, page_size: 10 } })
            .then((res) => {
                setArticles(res.data.data.list || []);
                setTotal(res.data.data.total || 0);
            }).catch(() => { });

        request.get('/categories').then((res) => {
            const cats = res.data.data.list || res.data.data || [];
            const cat = cats.find((c: { id: number }) => c.id === Number(id));
            if (cat) setCategoryName(cat.name);
        }).catch(() => { });
    }, [id, page]);

    return (
        <div>
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>
                分类: <span style={{ color: '#3370ff' }}>{categoryName}</span>
            </h2>
            {articles.length === 0 ? (
                <p style={{ color: '#999' }}>该分类下暂无文章</p>
            ) : (
                articles.map((a) => <ArticleCard key={a.id} article={a} />)
            )}
            <Pagination current={page} total={total} pageSize={10} basePath={`/category/${id}`} />
        </div>
    );
}
