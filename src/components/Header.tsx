import React from 'react';

interface HeaderProps {
    title: string;
    subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => (
    <header className="header">
        <h1>{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
    </header>
);
