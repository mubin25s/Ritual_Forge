export type Duration = '1_day' | '3_days' | '7_days' | '1_month' | '1_year' | 'unlimited';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'once';

export interface Habit {
    id: string;
    title: string;
    frequency: Frequency;
    createdAt: string; // ISO string Date
    scheduledDays?: number[]; // Array of 0-6 indicating scheduled days for weekly tasks
    scheduledMonthDay?: number; // 1-31 for monthly tasks
}

export interface ActivityDate {
    date: string; // YYYY-MM-DD
    completedHabitIds: string[];
}
