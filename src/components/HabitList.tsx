import React from 'react';
import type { Habit, Category } from '../types';
import { HeartPulse, Shield, Feather, Compass, Moon, Sparkles, CheckCircle2, Target, Trash2 } from 'lucide-react';

interface HabitCardProps {
    habit: Habit;
    isDone: boolean;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

const getCatIcon = (cat: Category) => {
    switch (cat) {
        case 'health': return <HeartPulse size={24} color="var(--color-crimson)" />;
        case 'work': return <Shield size={24} color="var(--color-gold)" />;
        case 'study': return <Feather size={24} color="#fff" />;
        default: return <Compass size={24} color="var(--color-ash-light)" />;
    }
};

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isDone, onToggle, onDelete }) => (
    <div className="habit-card">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
            {getCatIcon(habit.category)}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="habit-title" style={{
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.3 : 1
                    }}>
                        {habit.title}
                    </span>
                </div>
                <div className="habit-meta">
                    {habit.time && <span style={{ color: 'var(--color-gold)' }}>HOUR: {habit.time}</span>}
                </div>
            </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
            <button
                className={`check-button ${isDone ? 'completed' : ''}`}
                onClick={() => onToggle(habit.id)}
            >
                {isDone ? <CheckCircle2 size={24} /> : <Target size={24} />}
            </button>
            <button onClick={() => onDelete(habit.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-wine)', cursor: 'pointer', padding: '0.5rem' }}>
                <Trash2 size={20} />
            </button>
        </div>
    </div>
);

interface HabitListProps {
    habits: Habit[];
    activityData: Record<string, string[]>;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export const HabitList: React.FC<HabitListProps> = ({ habits, activityData, onToggle, onDelete }) => {
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="panel">
            <h2 className="panel-title">
                <Moon size={32} color="var(--color-gold)" />
                Active Observances
            </h2>

            <div className="habit-list">
                {habits.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0', opacity: 0.3 }}>
                        <Sparkles size={64} style={{ marginBottom: '1.5rem' }} />
                        <p style={{ fontFamily: 'var(--serif-font)', letterSpacing: '2px' }}>The silence of an empty path.</p>
                    </div>
                ) : (
                    habits.map(habit => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            isDone={activityData[todayStr]?.includes(habit.id) || false}
                            onToggle={onToggle}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
