import { Flame } from 'lucide-react';

interface ProductivityStreakProps {
  days: number;
}

export const ProductivityStreak = ({ days }: ProductivityStreakProps) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
        <Flame className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500">Productivity Streak</p>
        <p className="text-sm font-semibold text-zinc-900">
          {days === 0
            ? 'No streak yet — complete a task today'
            : `${days} day${days === 1 ? '' : 's'}`}
        </p>
      </div>
    </div>
  );
};
