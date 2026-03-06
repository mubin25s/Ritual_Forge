import React, { useState, useEffect, useMemo } from 'react';
import {
  Trash2,
  Zap,
  Wind,
  Archive,
  Hexagon,
  Circle,
  Square,
  Shield,
  Target,
  Activity,
  HeartPulse,
  BookOpen,
  Compass,
  Mic,
  Settings,
  Globe,
  Plus,
  ArrowRight,
  Clock,
  Play,
  RotateCcw
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfWeek, subWeeks, parseISO } from 'date-fns';
type Frequency = 'daily' | 'weekly' | 'monthly' | 'once';
type Category = 'health' | 'work' | 'personal' | 'study';
type Priority = 'low' | 'medium' | 'high';

interface Habit {
  id: string;
  title: string;
  frequency: Frequency;
  category: Category;
  priority: Priority;
  createdAt: string; // ISO DateTime
  scheduledDays?: number[]; // 0-6
  scheduledMonthDay?: number; // 1-31
  time?: string; // HH:mm format
}

type ActivityData = Record<string, string[]>; // 'YYYY-MM-DD' => array of habit IDs completed

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activityData, setActivityData] = useState<ActivityData>({});

  // New habit form state
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [category, setCategory] = useState<Category>('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [scheduledDays, setScheduledDays] = useState<number[]>([]);
  const [monthDay, setMonthDay] = useState<number>(1);
  const [time, setTime] = useState('');
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string }[]>([]);
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  // Deep Focus Timer state
  const [focusActive, setFocusActive] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60); // 25 minutes

  // Load from local storage
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    const savedActivity = localStorage.getItem('activityData');
    if (savedHabits) {
      const parsed = JSON.parse(savedHabits);
      // Backwards compatibility for habits without categories or priority
      const normalized = parsed.map((h: any) => ({
        ...h,
        category: h.category || 'personal',
        priority: h.priority || 'medium'
      }));
      setHabits(normalized);
    }
    if (savedActivity) setActivityData(JSON.parse(savedActivity));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('activityData', JSON.stringify(activityData));
  }, [habits, activityData]);

  // Quotes Array
  const quotes = useMemo(() => [
    "Simplicity is the ultimate sophistication. Refine your intent.",
    "The quality of your life is the quality of your focus and rituals.",
    "Order is not a pressure, but a relief for the searching soul.",
    "Discipline is the bridge between goals and accomplishment.",
    "Silence the noise. Amplify the signal of your true aspirations."
  ], []);
  const todayQuote = useMemo(() => quotes[new Date().getDay() % quotes.length], [quotes]);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      title,
      frequency,
      category,
      priority,
      scheduledDays: frequency === 'weekly' ? scheduledDays : undefined,
      scheduledMonthDay: frequency === 'monthly' ? monthDay : undefined,
      time: time || undefined,
      createdAt: new Date().toISOString()
    };

    const newHabits = [newHabit, ...habits];
    setHabits(newHabits);
    localStorage.setItem('habits', JSON.stringify(newHabits));

    // Reset form
    setTitle('');
    setPriority('medium');
    setScheduledDays([]);
    setMonthDay(1);
    setTime('');
  };

  const deleteHabit = (habitId: string) => {
    if (window.confirm("Are you sure you want to delete this task completely?")) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Time Reminder Logic
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHrm = format(now, 'HH:mm');

      habits.forEach(h => {
        // If it's a "Today" task, has a time, is exactly that time, not notified yet, and not completed
        const isToday = (h.frequency === 'daily') ||
          (h.frequency === 'weekly' && h.scheduledDays?.includes(now.getDay())) ||
          (h.frequency === 'monthly' && h.scheduledMonthDay === now.getDate());

        if (isToday && h.time === currentHrm && !notifiedIds.has(h.id) && !activityData[todayStr]?.includes(h.id)) {
          // Show Toast
          const id = crypto.randomUUID();
          setToasts(prev => [...prev, { id, title: h.title, message: `It's time to start your ritual: ${h.title}` }]);
          setNotifiedIds(prev => new Set(prev).add(h.id));

          // Audio cue could go here

          // Auto remove toast
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
          }, 8000);
        }
      });

      // Cleanup notifies at midnight
      if (currentHrm === '00:00') setNotifiedIds(new Set());

    }, 1000 * 30); // check twice a minute

    return () => clearInterval(checkInterval);
  }, [habits, notifiedIds, activityData, todayStr]);

  const toggleHabit = (habitId: string) => {
    setActivityData(prev => {
      const todayHits = prev[todayStr] || [];
      const isCompleted = todayHits.includes(habitId);

      const newHits = isCompleted
        ? todayHits.filter(id => id !== habitId)
        : [...todayHits, habitId];

      return {
        ...prev,
        [todayStr]: newHits
      };
    });
  };

  // Streak Calculation
  const { currentStreak, maxStreak } = useMemo(() => {
    let current = 0;
    let max = 0;

    // To calculate proper max streak we should iterate through all recorded dates
    const datesWithActivity = Object.keys(activityData).filter(date => activityData[date] && activityData[date].length > 0).sort();

    // Compute simple max streak based on consecutive active days
    let tempStreak = 0;

    if (datesWithActivity.length > 0) {
      let lastDate: Date | null = null;

      datesWithActivity.forEach(dateStr => {
        const dateObj = parseISO(dateStr);
        if (!lastDate) {
          tempStreak = 1;
        } else {
          const diffTime = Math.abs(dateObj.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else {
            tempStreak = 1; // reset
          }
        }
        if (tempStreak > max) max = tempStreak;
        lastDate = dateObj;
      });

      // Now current streak
      let d = new Date();
      let cStreak = 0;

      // Handle today
      if (activityData[todayStr]?.length > 0) {
        cStreak = 1;
        let prevDate = subDays(d, 1);
        while (activityData[format(prevDate, 'yyyy-MM-dd')]?.length > 0) {
          cStreak++;
          prevDate = subDays(prevDate, 1);
        }
      } else {
        // Maybe yesterday was last completion
        let prevDate = subDays(d, 1);
        if (activityData[format(prevDate, 'yyyy-MM-dd')]?.length > 0) {
          cStreak = 1;
          prevDate = subDays(prevDate, 1);
          while (activityData[format(prevDate, 'yyyy-MM-dd')]?.length > 0) {
            cStreak++;
            prevDate = subDays(prevDate, 1);
          }
        }
      }
      current = cStreak;
    }

    return {
      currentStreak: current,
      maxStreak: max
    };
  }, [activityData, todayStr]);

  // Generate GitHub-style graph data
  const graphWeeks = useMemo(() => {
    const today = new Date();
    // 53 weeks to show full year approximately
    const startOfGraph = startOfWeek(subWeeks(today, 52));
    const allDays = eachDayOfInterval({ start: startOfGraph, end: today });

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    allDays.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === allDays.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  }, []);

  const getCategoryIcon = (cat: Category, size = 16) => {
    switch (cat) {
      case 'health': return <Activity size={size} color="var(--gold-accent)" />;
      case 'work': return <Hexagon size={size} color="rgba(255,255,255,0.4)" />;
      case 'study': return <BookOpen size={size} color="rgba(255,255,255,0.4)" />;
      case 'personal': default: return <Circle size={size} color="rgba(255,255,255,0.4)" />;
    }
  };

  const todayWeekday = new Date().getDay();
  const todayMonthDay = new Date().getDate();

  const todayHabits = habits.filter(h => {
    if (h.frequency === 'weekly' && h.scheduledDays && h.scheduledDays.length > 0) {
      return h.scheduledDays.includes(todayWeekday);
    }
    if (h.frequency === 'monthly' && h.scheduledMonthDay) {
      return h.scheduledMonthDay === todayMonthDay;
    }
    return true; // daily, once, etc.
  }).sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1; // a without time comes after b with time
    if (!b.time) return -1; // b without time comes after a with time
    return a.time.localeCompare(b.time);
  });



  const todayTotal = todayHabits.length;
  const todayCompletedCount = todayHabits.filter(h => activityData[todayStr]?.includes(h.id)).length;
  const progressPercent = todayTotal === 0 ? 0 : Math.round((todayCompletedCount / todayTotal) * 100);

  return (
    <div className="app-container">
      <div className="ambient-glow"></div>

      <header>
        <h1>Ritual Forge</h1>
        <p className="header-subtitle">CELESTIAL MINIMALIST // LEGACY ARCHIVE // {todayStr}</p>
        <div style={{ marginTop: '5rem', fontSize: '1.4rem', fontStyle: 'italic', fontVariantCaps: 'all-small-caps', letterSpacing: '0.15em', fontWeight: 300, color: 'rgba(255,255,255,0.7)' }}>
          "{todayQuote}"
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{currentStreak}</span>
          <span className="stat-label">CONTINUITY</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{progressPercent}%</span>
          <span className="stat-label">CLARITY</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{maxStreak}</span>
          <span className="stat-label">LEGACY RECORD</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{habits.length}</span>
          <span className="stat-label">SET INTENTIONS</span>
        </div>
      </section>

      <div className="main-content">
        <div className="panel">
          <h2 className="panel-title">THESE ARE YOUR INTENTIONS TODAY</h2>

          <div className="habit-list">
            {todayHabits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '10rem 0', opacity: 0.2 }}>
                <Wind size={48} strokeWidth={1} style={{ marginBottom: '2rem' }} />
                <p style={{ letterSpacing: '0.2em', fontSize: '0.75rem', textTransform: 'uppercase' }}>A moment of stillness. No intentions remain.</p>
              </div>
            ) : (
              todayHabits.map(habit => {
                const isCompletedToday = activityData[todayStr]?.includes(habit.id);
                return (
                  <div key={habit.id} className="habit-card" style={{ opacity: isCompletedToday ? 0.3 : 1 }}>
                    <div className="habit-info">
                      <div className="habit-title" style={{ textDecoration: isCompletedToday ? 'none' : 'none' }}>
                        {habit.title}
                      </div>
                      <div className="habit-meta">
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <span className={`priority-indicator priority-${habit.priority}`}></span>
                          {habit.priority}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getCategoryIcon(habit.category, 14)}
                          {habit.category}
                        </span>
                        {habit.time && (
                          <span style={{ color: 'var(--gold-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} />
                            {habit.time}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: '0.3s' }}
                      >
                        <Archive size={18} />
                      </button>
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`check-button ${isCompletedToday ? 'completed' : ''}`}
                      >
                        {isCompletedToday ? <Plus size={20} style={{ transform: 'rotate(45deg)' }} /> : <Plus size={20} />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="right-column">
          <div className="panel" style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '4rem' }}>
            <h2 className="panel-title">SEAL NEW INTENT</h2>
            <form onSubmit={handleAddHabit}>
              <div className="form-group">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="EXPRESS INTENT..."
                  required
                />
              </div>

              <div className="form-group">
                <select value={category} onChange={e => setCategory(e.target.value as Category)}>
                  <option value="personal">PERSONAL DOMAIN</option>
                  <option value="work">PROFESSIONAL FOCUS</option>
                  <option value="health">VITALITY</option>
                  <option value="study">ACADEMIC MASTERY</option>
                </select>
              </div>

              <div className="form-group">
                <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                  <option value="high">ABSOLUTE (HIGH)</option>
                  <option value="medium">ESSENTIAL (MID)</option>
                  <option value="low">MINOR (LOW)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                COMMIT INTENTION
              </button>
            </form>

            <div style={{ marginTop: '8rem', borderTop: '1px solid var(--glass-border)', paddingTop: '4rem' }}>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '2rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={14} /> DEEP FOCUS SESSION
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: 'Instrument Serif', fontStyle: 'italic', fontWeight: 300 }}>
                  25:00
                </div>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--gold-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}
                >
                  <Play size={14} fill="var(--gold-accent)" /> INITIATE FOCUS
                </button>
              </div>
            </div>

            <div style={{ marginTop: '8rem' }}>
              <h2 className="panel-title" style={{ fontSize: '1.1rem', marginBottom: '2rem', border: 'none' }}>LEGACY CHART</h2>
              <div className="contribution-graph">
                {graphWeeks.slice(-10).map((week, weekIdx) => (
                  <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {week.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const count = activityData[dateStr]?.length || 0;
                      const level = count === 0 ? 0 : (count < 2 ? 1 : (count < 4 ? 2 : (count < 6 ? 3 : 4)));
                      return (
                        <div
                          key={dateStr}
                          className={`contribution-cell contrib-level-${level}`}
                          title={`${format(day, 'MMM do')}: ${count} intents confirmed`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toasts.length > 0 && (
        <div className="toast-container" style={{ position: 'fixed', zIndex: 9999 }}>
          {toasts.map(t => (
            <div key={t.id} className="toast">
              <h4 style={{ fontFamily: 'Instrument Serif', fontSize: '1.4rem', fontWeight: 400, fontStyle: 'italic', marginBottom: '0.5rem' }}>A Reminder to Act</h4>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6 }}>{t.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
