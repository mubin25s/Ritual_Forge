import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Plus,
  CalendarDays,
  Target,
  ListTodo,
  Trash2,
  Briefcase,
  HeartPulse,
  BookOpen,
  User,
  Quote,
  Sparkles
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfWeek, subWeeks, parseISO } from 'date-fns';

type Duration = '1_day' | '3_days' | '7_days' | '1_month' | '1_year' | 'unlimited';
type Frequency = 'daily' | 'weekly' | 'monthly' | 'once';
type Category = 'health' | 'work' | 'personal' | 'study';

interface Habit {
  id: string;
  title: string;
  duration: Duration;
  frequency: Frequency;
  category: Category;
  createdAt: string; // ISO DateTime
}

type ActivityData = Record<string, string[]>; // 'YYYY-MM-DD' => array of habit IDs completed

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activityData, setActivityData] = useState<ActivityData>({});

  // New habit form state
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<Duration>('unlimited');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [category, setCategory] = useState<Category>('personal');

  // Load from local storage
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    const savedActivity = localStorage.getItem('activityData');
    if (savedHabits) {
      const parsed = JSON.parse(savedHabits);
      // Backwards compatibility for habits without categories
      const normalized = parsed.map((h: any) => ({
        ...h,
        category: h.category || 'personal'
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
    "Small daily improvements are the key to staggering long-term results.",
    "We are what we repeatedly do. Excellence is not an act, but a habit.",
    "The secret of your future is hidden in your daily routine.",
    "Success is the product of daily habits—not transformations.",
    "Every action you take is a vote for the type of person you wish to become."
  ], []);
  const todayQuote = useMemo(() => quotes[new Date().getDay() % quotes.length], [quotes]);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      title,
      duration,
      frequency,
      category,
      createdAt: new Date().toISOString()
    };

    setHabits([newHabit, ...habits]);
    setTitle('');
  };

  const deleteHabit = (habitId: string) => {
    if (window.confirm("Are you sure you want to delete this task completely?")) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

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
  const { currentStreak, maxStreak, totalCompletions } = useMemo(() => {
    let current = 0;
    let max = 0;
    let total = 0;

    // To calculate proper max streak we should iterate through all recorded dates
    const datesWithActivity = Object.keys(activityData).filter(date => activityData[date] && activityData[date].length > 0).sort();

    total = Object.values(activityData).reduce((acc, curr) => acc + curr.length, 0);

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
      maxStreak: max,
      totalCompletions: total
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

  const getContributionColorClass = (count: number) => {
    if (count === 0) return 'contrib-level-0';
    if (count === 1) return 'contrib-level-1';
    if (count === 2) return 'contrib-level-2';
    if (count === 3) return 'contrib-level-3';
    return 'contrib-level-4';
  };

  const getCategoryIcon = (cat: Category, size = 16) => {
    switch (cat) {
      case 'health': return <HeartPulse size={size} color="#ef4444" />;
      case 'work': return <Briefcase size={size} color="#f59e0b" />;
      case 'study': return <BookOpen size={size} color="#4f46e5" />;
      case 'personal': default: return <User size={size} color="#818cf8" />;
    }
  };

  const todayTotal = habits.length;
  const todayCompletedCount = habits.filter(h => activityData[todayStr]?.includes(h.id)).length;
  const progressPercent = todayTotal === 0 ? 0 : Math.round((todayCompletedCount / todayTotal) * 100);
  const isAllDone = todayTotal > 0 && todayCompletedCount === todayTotal;

  return (
    <div className="app-container">
      <header className="header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="header-title-container">
          <h1>Ritual Forge</h1>
          <p className="header-subtitle">Build habits, forge your daily routine</p>
        </div>
        <div className="action">
          <button className="btn btn-secondary">
            <CalendarDays size={18} style={{ marginRight: '6px' }} />
            Today: {format(new Date(), 'MMMM do, yyyy')}
          </button>
        </div>
      </header>

      <div className="quote-banner">
        <Quote size={20} className="quote-icon" />
        <p>{todayQuote}</p>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon fire">
            <Flame size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{currentStreak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon trophy">
            <Trophy size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{maxStreak}</span>
            <span className="stat-label">Best Streak</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent)' }}>
            <Target size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalCompletions}</span>
            <span className="stat-label">Total Contributions</span>
          </div>
        </div>
      </section>

      <div className="main-content">
        <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div className="panel">
            <h2 className="panel-title">
              <Target size={24} color="var(--accent)" />
              Activity Board
            </h2>
            <div className="contribution-graph-wrapper">
              <div className="contribution-graph">
                {graphWeeks.map((week, wIndex) => (
                  <div key={wIndex} className="contribution-col">
                    {wIndex === 0 && week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ width: 12, height: 12 }}></div>
                    ))}
                    {week.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const completions = activityData[dateStr]?.length || 0;
                      return (
                        <div
                          key={dateStr}
                          className={`contribution-cell ${getContributionColorClass(completions)}`}
                        >
                          <div className="tooltip">
                            {completions} {completions === 1 ? 'task' : 'tasks'} on {format(day, 'MMM d, yyyy')}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.5rem' }}>
              Less
              <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--contrib-level-0)', margin: '0 4px', borderRadius: 2 }}></span>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--contrib-level-1)', margin: '0 4px', borderRadius: 2 }}></span>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--contrib-level-2)', margin: '0 4px', borderRadius: 2 }}></span>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--contrib-level-3)', margin: '0 4px', borderRadius: 2 }}></span>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--contrib-level-4)', margin: '0 4px', borderRadius: 2 }}></span>
              More
            </p>
          </div>

          <div className="panel" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 className="panel-title" style={{ marginBottom: 0 }}>
                <ListTodo size={24} color="var(--accent)" />
                Today's Tasks
              </h2>
              {todayTotal > 0 && (
                <span className="badge" style={{ background: isAllDone ? 'var(--success)' : 'var(--accent)', color: 'white', fontWeight: 'bold', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {isAllDone && <Sparkles size={14} />} {progressPercent}% Done
                </span>
              )}
            </div>

            {todayTotal > 0 && (
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: isAllDone ? 'var(--success)' : 'var(--accent-gradient)' }}></div>
              </div>
            )}

            <div className="habit-list">
              {habits.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                  No tasks added yet. Create one to get started!
                </p>
              ) : (
                habits.map(habit => {
                  const isCompletedToday = activityData[todayStr]?.includes(habit.id);
                  return (
                    <div key={habit.id} className="habit-card">
                      <div className="habit-info">
                        <span className="habit-title" style={{
                          textDecoration: isCompletedToday ? 'line-through' : 'none',
                          color: isCompletedToday ? 'var(--text-muted)' : 'var(--text-primary)'
                        }}>
                          {habit.title}
                        </span>
                        <div className="habit-meta">
                          <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {getCategoryIcon(habit.category, 12)}
                            {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                          </span>
                          <span className="badge">{habit.duration.replace('_', ' ')}</span>
                          <span className="badge" style={{ textTransform: 'capitalize' }}>{habit.frequency.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="habit-actions">
                        <button
                          className="delete-btn"
                          onClick={() => deleteHabit(habit.id)}
                          title="Delete Task completely"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => toggleHabit(habit.id)}
                          className={`check-button ${isCompletedToday ? 'completed' : ''}`}
                        >
                          <CheckCircle2 size={24} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>

        <div className="right-column">
          <div className="panel">
            <h2 className="panel-title" style={{ fontSize: '1.2rem' }}>
              <Plus size={20} />
              Add New Task
            </h2>
            <form onSubmit={handleAddHabit}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Study for one hour..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <div className="category-selector">
                  {(['personal', 'work', 'health', 'study'] as Category[]).map(c => (
                    <label key={c} className={`category-radio ${category === c ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="category"
                        value={c}
                        checked={category === c}
                        onChange={() => setCategory(c)}
                        style={{ display: 'none' }}
                      />
                      {getCategoryIcon(c, 16)}
                      <span>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <select value={duration} onChange={e => setDuration(e.target.value as Duration)}>
                    <option value="1_day">1 Day</option>
                    <option value="3_days">3 Days</option>
                    <option value="7_days">7 Days</option>
                    <option value="1_month">1 Month</option>
                    <option value="1_year">1 Year</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Frequency</label>
                  <select value={frequency} onChange={e => setFrequency(e.target.value as Frequency)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="once">One Time</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Plus size={18} />
                Add Task
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
