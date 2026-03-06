export type Duration = '1_day' | '3_days' | '7_days' | '1_month' | '1_year' | 'unlimited';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'once';

export interface Habit {
    id: string;
    title: string;
    duration: Duration;
    frequency: Frequency;
    createdAt: string; // ISO string Date
}

export interface ActivityDate {
    date: string; // YYYY-MM-DD
    completedHabitIds: string[];
}
