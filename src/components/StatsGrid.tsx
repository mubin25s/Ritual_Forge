import React from 'react';
import { Sun, Layers, Target } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
    <div className="stat-card">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {icon && <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.3 }}>{icon}</div>}
    </div>
);

interface StatsGridProps {
    currentStreak: number;
    progressPercent: number;
    totalActive: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
    currentStreak,
    progressPercent,
    totalActive
}) => (
    <section className="stats-grid">
        <StatCard label="Consecutive Devotion" value={currentStreak} icon={<Sun size={16} />} />
        <StatCard label="Active Observances" value={totalActive} icon={<Layers size={16} />} />
        <StatCard label="Resonance Frequency" value={`${progressPercent}%`} icon={<Target size={16} />} />
    </section>
);
