import type { Category, Tag } from '@blog/shared';
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { request } from '@blog/shared';

export default function Sidebar() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    useEffect(() => {
        request.get('/categories').then((res) => {
            setCategories(res.data.data.list || res.data.data || []);
        }).catch(() => { });

        request.get('/tags').then((res) => {
            setTags(res.data.data.list || res.data.data || []);
        }).catch(() => { });
    }, []);

    return (
        <div>
            {/* Categories */}
            <div style={{
                background: '#fff',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #3370ff' }}>
                    分类
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {categories.map((cat) => (
                        <li key={cat.id} style={{ padding: '6px 0' }}>
                            <Link to={`/category/${cat.id}`} style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                <span>{cat.name}</span>
                                {cat.article_count !== undefined && (
                                    <span style={{ color: '#999', fontSize: 12 }}>{cat.article_count}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                    {categories.length === 0 && <li style={{ color: '#999', fontSize: 13 }}>暂无分类</li>}
                </ul>
            </div>

            {/* Tags */}
            <div style={{
                background: '#fff',
                borderRadius: 8,
                padding: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #3370ff' }}>
                    标签
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tags.map((tag) => (
                        <Link
                            key={tag.id}
                            to={`/tag/${tag.slug}`}
                            style={{
                                background: '#f0f5ff',
                                color: '#3370ff',
                                padding: '3px 10px',
                                borderRadius: 4,
                                fontSize: 13,
                            }}
                        >
                            {tag.name}
                        </Link>
                    ))}
                    {tags.length === 0 && <span style={{ color: '#999', fontSize: 13 }}>暂无标签</span>}
                </div>
            </div>
        </div>
    );
}
