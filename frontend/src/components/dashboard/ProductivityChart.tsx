import { DayBar } from '../../utils/taskQueries';

interface ProductivityChartProps {
  days: DayBar[];
}

export const ProductivityChart = ({ days }: ProductivityChartProps) => {
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900">
        Productivity (This Week)
      </h3>
      <div className="flex h-36 items-end gap-2">
        {days.map((day) => {
          const heightPct = Math.round((day.count / max) * 100);
          return (
            <div
              key={day.key}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="text-[10px] tabular-nums text-zinc-400">
                {day.count > 0 ? day.count : ''}
              </span>
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className="w-full max-w-[28px] rounded-t-md bg-zinc-900 transition-all"
                  style={{ height: `${Math.max(day.count > 0 ? 8 : 2, heightPct)}%` }}
                  title={`${day.label}: ${day.count}`}
                />
              </div>
              <span className="text-[11px] font-medium text-zinc-500">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
