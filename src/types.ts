export type Frequency = 'daily' | 'weekly' | 'monthly' | 'once';
export type Category = 'health' | 'work' | 'personal' | 'study';
export type Priority = 'low' | 'medium' | 'high';

export interface Habit {
    id: string;
    title: string;
    frequency: Frequency;
    category: Category;



    createdAt: string; // ISO string Date
    scheduledDays?: number[]; // 0-6
    scheduledMonthDay?: number; // 1-31
    time?: string; // HH:mm
}

export type ActivityData = Record<string, string[]>; // 'YYYY-MM-DD' => array of habit IDs completed

export interface Toast {
    id: string;
    title: string;
    message: string;
}
