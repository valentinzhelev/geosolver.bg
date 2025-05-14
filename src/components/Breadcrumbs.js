import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const pathNames = {
    '/': 'Начало',
    '/purva-zadacha': 'Първа основна задача',
    '/vtora-zadacha': 'Втора основна задача',
};

const Breadcrumbs = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const parts = currentPath.split('/').filter(p => p);
    const crumbs = parts.map((part, index) => {
        const path = '/' + parts.slice(0, index + 1).join('/');
        const label = pathNames[path] || part;

        return (
            <Link to={path}>{label}</Link>
        );
    });

    return (
        <div className="breadcrumbs">
            <Link to="/">Начало</Link>
            {crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    <i className="fas fa-angle-right" style={{ margin: '0 0.5em', color: '#999' }}></i>
                    {crumb}
                </React.Fragment>
            ))}
        </div>
    );



};

export default Breadcrumbs;
