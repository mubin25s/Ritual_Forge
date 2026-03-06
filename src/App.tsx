import { useHabitTracker } from './hooks/useHabitTracker';

import { StatsGrid } from './components/StatsGrid';
import type { Habit } from './types';
import { HabitList } from './components/HabitList';
import { SowIntentionForm } from './components/SowIntentionForm';
import { ContributionGraph } from './components/ContributionGraph';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Plus, X, ArrowRight } from 'lucide-react';

function App() {
  const {
    habits,
    activityData,
    toasts,
    streakData,
    graphWeeks,
    handleAddHabit,
    toggleHabit,
    deleteHabit
  } = useHabitTracker();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'observances'>('dashboard');

  // Quotes Array
  const quotes = useMemo(() => [
    "The soul is dyed the color of its thoughts.",
    "Discipline is the highest form of self-love.",
    "Silence in the depths, strength in the stride.",
    "True beauty is found in the weight of one's purpose.",
    "Character is built in the shadows of one's daily devotion."
  ], []);
  const todayQuote = useMemo(() => quotes[new Date().getDay() % quotes.length], [quotes]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayWeekday = new Date().getDay();
  const todayMonthDay = new Date().getDate();

  const todayHabits = useMemo(() => habits.filter((h: Habit) => {
    if (h.frequency === 'weekly' && h.scheduledDays?.length) return h.scheduledDays.includes(todayWeekday);
    if (h.frequency === 'monthly' && h.scheduledMonthDay) return h.scheduledMonthDay === todayMonthDay;
    return true;
  }).sort((a: Habit, b: Habit) => (a.time || '99:99').localeCompare(b.time || '99:99')), [habits, todayWeekday, todayMonthDay]);

  const otherHabits = useMemo(() => habits.filter((h: Habit) => !todayHabits.includes(h)), [habits, todayHabits]);

  const progressPercent = todayHabits.length === 0 ? 0 : Math.round((todayHabits.filter(h => activityData[todayStr]?.includes(h.id)).length / todayHabits.length) * 100);

  return (
    <div className="app-container">
      <div className="ambient-glow" />
      <div className="smoke-overlay" />

      {view === 'dashboard' ? (
        <div className="dashboard-hero">
          <div className="hero-title-group">
            <h1 className="hero-title">RITUAL FORGE</h1>
            <div className="hero-subtitle">Crimson & Ash Domain</div>
          </div>

          <div className="hero-quote-container">
            <p className="hero-quote">"{todayQuote}"</p>
          </div>

          <button
            className="forge-btn"
            onClick={() => setView('observances')}
          >
            Enter the Forge <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        <div style={{ animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontFamily: 'var(--serif-font)', fontSize: '2rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '4px' }}>Observances</h1>
              <p style={{ color: 'var(--color-gold)', fontSize: '0.7rem', letterSpacing: '3px' }}>{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>
            <button
              onClick={() => setView('dashboard')}
              style={{ background: 'transparent', border: '1px solid var(--color-smoke)', color: 'var(--color-ash-light)', padding: '0.8rem 1.5rem', cursor: 'pointer', fontFamily: 'var(--serif-font)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.7rem' }}
            >
              Return Home
            </button>
          </div>

          <StatsGrid
            currentStreak={streakData.currentStreak}
            progressPercent={progressPercent}
            totalActive={todayHabits.length}
          />

          <div className="main-content">
            <div className="left-column">
              <HabitList
                habits={todayHabits}
                activityData={activityData}
                onToggle={toggleHabit}
                onDelete={deleteHabit}
              />

              {otherHabits.length > 0 && (
                <div style={{ marginTop: '5rem', opacity: 0.4 }}>
                  <h3 style={{ fontFamily: 'var(--serif-font)', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '3px' }}>
                    FORTHCOMING VOWS
                  </h3>
                  <div className="habit-list">
                    {otherHabits.map(habit => (
                      <div key={habit.id} className="habit-card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                          <span className="habit-title" style={{ fontSize: '1rem', color: 'var(--color-ash-light)' }}>{habit.title}</span>
                          <span className="habit-meta" style={{ marginTop: 0 }}>{habit.frequency.toUpperCase()}</span>
                        </div>
                        <button onClick={() => deleteHabit(habit.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-smoke)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="right-column">
              <ContributionGraph graphWeeks={graphWeeks} activityData={activityData} />
            </div>
          </div>
        </div>
      )}

      <button className="fab-button" onClick={() => setIsModalOpen(true)}>
        <Plus size={32} />
      </button>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={24} />
            </button>
            <SowIntentionForm
              onSubmit={handleAddHabit}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {toasts.length > 0 && (
        <div className="toast-container" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
          {toasts.map(t => (
            <div key={t.id} className="panel" style={{
              background: 'var(--bg-charcoal)',
              borderColor: 'var(--color-wine)',
              padding: '1.5rem',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-velvet)'
            }}>
              <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '2px' }}>Devotion Recall</div>
              <div style={{ fontWeight: 600, color: '#fff' }}>{t.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline trash icon for the small other habits list since it's just a helper
const Trash2 = ({ size, color }: { size: number, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);

export default App;
