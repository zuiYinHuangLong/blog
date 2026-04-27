import type { Article } from '@blog/shared';
import { Link } from 'react-router-dom';
import { formatDate } from '@blog/shared';

export default function ArticleCard({ article }: { article: Article }) {
    return (
        <article style={{
            background: '#fff',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            marginBottom: 20,
            display: 'flex',
            transition: 'box-shadow 0.2s',
        }}>
            {article.cover_image && (
                <div style={{ width: 200, flexShrink: 0 }}>
                    <img
                        src={article.cover_image}
                        alt={article.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            )}
            <div style={{ padding: 20, flex: 1 }}>
                <Link to={`/article/${article.slug}`}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>
                        {article.title}
                    </h2>
                </Link>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                    {article.summary || article.content.slice(0, 120) + '...'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#999' }}>
                    {article.category_name && (
                        <Link to={`/category/${article.category_id}`} style={{ color: '#3370ff' }}>
                            {article.category_name}
                        </Link>
                    )}
                    <span>{formatDate(article.published_at, 'YYYY-MM-DD')}</span>
                    <span>{article.view_count} 阅读</span>
                    {article.tags?.map((tag) => (
                        <Link key={tag.id} to={`/tag/${tag.slug}`} style={{
                            background: '#f0f5ff',
                            color: '#3370ff',
                            padding: '1px 8px',
                            borderRadius: 3,
                            fontSize: 12,
                        }}>
                            {tag.name}
                        </Link>
                    ))}
                </div>
            </div>
        </article>
    );
}
