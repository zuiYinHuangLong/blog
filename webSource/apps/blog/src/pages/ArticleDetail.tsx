import '../styles/article.css';

import { Link, useParams } from 'react-router-dom';
import { formatDate, request } from '@blog/shared';
import { useEffect, useState } from 'react';

import type { Article } from '@blog/shared';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export default function ArticleDetail() {
    const { slug } = useParams();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        request.get(`/public/articles/${slug}`)
            .then((res) => setArticle(res.data.data))
            .catch(() => setError('文章不存在'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <p style={{ textAlign: 'center', padding: 60, color: '#999' }}>加载中...</p>;
    if (error || !article) return <p style={{ textAlign: 'center', padding: 60, color: '#999' }}>{error || '文章不存在'}</p>;

    return (
        <article style={{ background: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{article.title}</h1>

            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#999', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                <span>{article.author_name}</span>
                <span>{formatDate(article.published_at, 'YYYY-MM-DD HH:mm')}</span>
                {article.category_name && (
                    <Link to={`/category/${article.category_id}`} style={{ color: '#3370ff' }}>
                        {article.category_name}
                    </Link>
                )}
                <span>{article.view_count} 阅读</span>
            </div>

            {article.tags && article.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {article.tags.map((tag) => (
                        <Link key={tag.id} to={`/tag/${tag.slug}`} style={{
                            background: '#f0f5ff', color: '#3370ff', padding: '2px 10px', borderRadius: 4, fontSize: 12,
                        }}>
                            {tag.name}
                        </Link>
                    ))}
                </div>
            )}

            <div className="article-body">
                {article.content_type === 'markdown' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {article.content}
                    </ReactMarkdown>
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
                )}
            </div>
        </article>
    );
}
