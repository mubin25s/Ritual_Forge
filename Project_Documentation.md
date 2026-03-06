# Ritual Forge - Celestial Aurora Project Documentation

## 1. Project Overview
**Ritual Forge** is a premium habit-shaping ecosystem designed for users who seek both discipline and aesthetic inspiration. By combining deep-space visuals with high-precision scheduling, the application transforms routine-building from a mundane task into an immersive experience.

The core objective is to leverage "Celestial Aurora" design principles—glassmorphism, vibrant neon accents, and space-themed depth—to drive long-term habit consistency.

## 2. The Celestial Aurora Upgrade
The project underwent a complete visual and functional transformation to exceed the limitations of standard productivity tools:
- **Immersive Aesthetic**: Moving from a basic "Forge" theme to a high-fidelity space environment.
- **Precision Scheduling**: Beyond daily tracking, users can now schedule rituals at specific hours, receive real-time notifications, and define complex weekly/monthly frequencies.
- **Two-Column UX**: A refined layout that separates task management (left) from ritual creation (right), featuring a sticky creation forge for seamless interaction.
- **Real-time Feedback**: Implementation of an animated toast notification system that monitors the system clock to alert users of upcoming rituals.

## 3. Core Features & Technical Functionality

### 🌌 Immersive Stats Dashboard
The dashboard uses three primary metrics to visualize productivity:
- **Day Streak**: Tracks consecutive active days using `parseISO` and `subDays` logic.
- **Best Streak**: Analyzes the historical activity map to identify the longest period of consistent usage.
- **Daily Focus**: A percentage-based indicator showing how many of today's scheduled rituals are completed.

### 🔔 Real-time Ritual Reminders
The application utilizes a background `setInterval` loop (checking every 30 seconds) to synchronize with the user's local time:
- **Reminders**: If a ritual's `time` matches the current `HH:mm`, a toast notification is triggered.
- **Smart Logic**: Notifications are only shown for scheduled rituals that haven't been completed yet for the current day.
- **Persistence**: Notified IDs are tracked in a transient `Set` state to prevent duplicate notifications within the same minute.

### 📅 Granular Frequency Engine
The scheduling engine supports four distinct cycles:
- **Daily**: Tasks recurring every 24 hours.
- **Weekly**: Customizable selection of specific days (e.g., Monday, Wednesday, Friday).
- **Monthly**: Locked to a specific date within the month (e.g., every 5th).
- **Once**: Single-event rituals that disappear after completion.

### 📈 Consistency Map (Heatmap)
A GitHub-style 52-week grid renders task completion history. It uses a 5-level intensity scale based on completion counts per day:
- **Level 0**: No activity.
- **Level 4**: Peak productivity (6+ rituals completed).

## 4. Architectural Implementation

### Technology Stack
- **React 19 & TypeScript**: Ensures a robust, type-safe development environment.
- **Lucide React**: Provides the high-quality iconography required for a premium feel.
- **Vanila CSS (Enhanced)**: The "Celestial Aurora" theme is built entirely on modern CSS variables, backdrops (`backdrop-filter`), and glassmorphic panels.

### Data persistence
- **Local Storage Integration**: All habits and completion maps are automatically serialized. The app includes a "backwards compatibility" layer in the `useEffect` hook to ensure legacy data formats are safely migrated to the new schema.

## 5. Design Philosophy
The UI follows **State-of-the-Art** design principles:
- **Space-Themed Depth**: Using `--bg-space` for foundational layers and nested glass panels for interface elements.
- **Aurora Accents**: Colors like Teal, Violet, and Indigo serve as functional indicators (categories and success states).
- **Visual Feedback**: Every interaction—from hovering over a contribution cell to completing a ritual—is accompanied by smooth transitions and micro-animations.

## 6. Conclusion
Ritual Forge represents the intersection of discipline and design. It is more than a tool; it is a digital sanctuary for builders, students, and professionals to forge their daily rituals in a space that feels as infinite as their potential.
