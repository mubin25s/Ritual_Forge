import { useState, useEffect, useMemo } from 'react';
import type { Habit, ActivityData, Toast } from '../types';
import { format, subDays, eachDayOfInterval, startOfWeek, subWeeks } from 'date-fns';

export function useHabitTracker() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [activityData, setActivityData] = useState<ActivityData>({});
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Load Initial State
    useEffect(() => {
        const storedHabits = localStorage.getItem('ritual_habits');
        const storedActivity = localStorage.getItem('ritual_activity');
        if (storedHabits) setHabits(JSON.parse(storedHabits));
        if (storedActivity) setActivityData(JSON.parse(storedActivity));
    }, []);

    // Persist State
    useEffect(() => {
        localStorage.setItem('ritual_habits', JSON.stringify(habits));
        localStorage.setItem('ritual_activity', JSON.stringify(activityData));
    }, [habits, activityData]);

    const addToast = (title: string, message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, title, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const handleAddHabit = (habitInput: Omit<Habit, 'id' | 'createdAt'>) => {
        const newHabit: Habit = {
            ...habitInput,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString()
        };
        setHabits(prev => [...prev, newHabit]);
        addToast("Ritual Seeded", `${newHabit.title} added to your observances.`);
    };

    const toggleHabit = (habitId: string) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        setActivityData(prev => {
            const current = prev[todayStr] || [];
            const newHits = current.includes(habitId)
                ? current.filter(id => id !== habitId)
                : [...current, habitId];

            if (!current.includes(habitId)) {
                addToast("Devotion Recorded", "Your ritual for today has been consummated.");
            }

            return { ...prev, [todayStr]: newHits };
        });
    };

    const deleteHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
        addToast("Observance Revoked", "The ritual has been removed from the registry.");
    };

    const streakData = useMemo(() => {
        let current = 0;
        const dates = Object.keys(activityData).filter(d => activityData[d]?.length > 0).sort().reverse();
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        let checkDate = dates.includes(today) ? today : (dates.includes(yesterday) ? yesterday : null);

        if (checkDate) {
            let d = new Date(checkDate);
            while (dates.includes(format(d, 'yyyy-MM-dd'))) {
                current++;
                d = subDays(d, 1);
            }
        }
        return { currentStreak: current };
    }, [activityData]);

    const graphWeeks = useMemo(() => {
        const end = new Date();
        const start = subWeeks(startOfWeek(end), 12);
        const days = eachDayOfInterval({ start, end });
        const weeks: Date[][] = [];
        let current: Date[] = [];
        days.forEach((d, i) => {
            current.push(d);
            if (current.length === 7 || i === days.length - 1) {
                weeks.push(current);
                current = [];
            }
        });
        return weeks;
    }, []);

    return {
        habits,
        activityData,
        toasts,
        streakData,
        graphWeeks,
        handleAddHabit,
        toggleHabit,
        deleteHabit
    };
}
