import React from 'react';
import { Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface ContributionGraphProps {
    graphWeeks: Date[][];
    activityData: Record<string, string[]>;
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({ graphWeeks, activityData }) => (
    <div className="panel" style={{ marginTop: '2.5rem' }}>
        <h2 className="panel-title">
            <Trophy size={32} color="var(--color-gold)" />
            Legacy Graph
        </h2>
        <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
            <div className="contribution-graph" style={{ minWidth: 'max-content' }}>
                {graphWeeks.map((week, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                        {week.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const count = activityData[dateStr]?.length || 0;
                            const level = count === 0 ? 0 : (count < 2 ? 1 : (count < 4 ? 2 : (count < 6 ? 3 : 4)));
                            return (
                                <div
                                    key={dateStr}
                                    className={`contribution-cell contrib-level-${level}`}
                                    style={{ flexShrink: 0 }}
                                    title={`${dateStr}: ${count} rituals`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    </div>
);
