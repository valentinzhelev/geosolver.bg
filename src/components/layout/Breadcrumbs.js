import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const pathNames = {
    '/': 'Начало',
    '/about-us': 'За нас',
    '/prices': 'Цени',
    '/first-task': 'Първа основна задача',
    '/second-task': 'Втора основна задача',
    '/forward-intersection': 'Права Засечка',
    '/resection': 'Обратна Засечка',
};

const Breadcrumbs = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const parts = currentPath.split('/').filter(p => p);
    const crumbs = parts.map((part, index) => {
        const path = '/' + parts.slice(0, index + 1).join('/');
        const label = pathNames[path] || part;
        // All breadcrumbs clickable, last one styled gray
        return (
            <Link to={path} style={index === parts.length - 1 ? { color: '#999', pointerEvents: 'auto', textDecoration: 'underline' } : { textDecoration: 'underline' }}>
                {label}
            </Link>
        );
    });

    return (
        <div className="breadcrumbs">
            {crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <i className="fas fa-angle-right" style={{ margin: '0 0.5em', color: '#999' }}></i>
                    )}
                    {crumb}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumbs;
