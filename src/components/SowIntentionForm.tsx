import React, { useState } from 'react';
import type { Habit, Category, Frequency } from '../types';
import { Plus } from 'lucide-react';

interface SowIntentionFormProps {
    onSubmit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
    onClose: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SowIntentionForm: React.FC<SowIntentionFormProps> = ({ onSubmit, onClose }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category>('personal');
    const [frequency, setFrequency] = useState<Frequency>('daily');
    const [scheduledDays, setScheduledDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
    const [scheduledMonthDay, setScheduledMonthDay] = useState<number>(1);
    const [time, setTime] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            category,
            frequency,
            scheduledDays: frequency === 'weekly' ? scheduledDays : undefined,
            scheduledMonthDay: frequency === 'monthly' ? scheduledMonthDay : undefined,
            time
        });
        setTitle('');
        setTime('');
        onClose();
    };

    const toggleDay = (index: number) => {
        setScheduledDays(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    return (
        <div className="panel">
            <h2 className="panel-title">
                <Plus size={32} color="var(--color-wine)" />
                Sow Intention
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Sacred Pursuit</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title of the ritual..." required />
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Domain</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {(['personal', 'work', 'health', 'study'] as Category[]).map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCategory(c)}
                                style={{
                                    padding: '0.5rem',
                                    background: category === c ? 'var(--color-wine)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: category === c ? '#fff' : 'var(--color-ash-light)',
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Iteration (Frequency)</label>
                    <select value={frequency} onChange={e => setFrequency(e.target.value as Frequency)}>
                        <option value="daily">Daily Flow</option>
                        <option value="weekly">Weekly Cycle</option>
                        <option value="monthly">Monthly Occult</option>
                    </select>
                </div>

                {frequency === 'weekly' && (
                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label>Sacred Days</label>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {DAYS.map((day, i) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(i)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: scheduledDays.includes(i) ? 'var(--color-wine)' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: scheduledDays.includes(i) ? '#fff' : 'var(--color-ash-light)',
                                        fontSize: '0.6rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {frequency === 'monthly' && (
                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label>Day of the Moon (1-31)</label>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={scheduledMonthDay}
                            onChange={e => setScheduledMonthDay(parseInt(e.target.value))}
                        />
                    </div>
                )}

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Hour of Devotion</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '2rem' }}>
                    Consummate Rite
                </button>
            </form>
        </div>
    );
};
