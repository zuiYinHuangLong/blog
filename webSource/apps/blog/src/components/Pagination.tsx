import { Link } from 'react-router-dom';

interface Props {
    current: number;
    total: number;
    pageSize: number;
    basePath: string;
}

export default function Pagination({ current, total, pageSize, basePath }: Props) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '24px 0' }}>
            {current > 1 && (
                <Link to={`${basePath}?page=${current - 1}`} style={btnStyle}>上一页</Link>
            )}
            {pages.map((p) => (
                <Link
                    key={p}
                    to={`${basePath}?page=${p}`}
                    style={{ ...btnStyle, ...(p === current ? activeStyle : {}) }}
                >
                    {p}
                </Link>
            ))}
            {current < totalPages && (
                <Link to={`${basePath}?page=${current + 1}`} style={btnStyle}>下一页</Link>
            )}
        </div>
    );
}

const btnStyle: React.CSSProperties = {
    padding: '6px 14px',
    border: '1px solid #ddd',
    borderRadius: 4,
    color: '#555',
    fontSize: 14,
};

const activeStyle: React.CSSProperties = {
    background: '#3370ff',
    color: '#fff',
    borderColor: '#3370ff',
};
