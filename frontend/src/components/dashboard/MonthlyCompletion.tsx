interface MonthlyCompletionProps {
  completed: number;
  goal: number;
  monthLabel: string;
}

export const MonthlyCompletion = ({
  completed,
  goal,
  monthLabel,
}: MonthlyCompletionProps) => {
  const percent = goal > 0 ? Math.min(100, Math.round((completed / goal) * 100)) : 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Monthly Completion
      </h3>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">{monthLabel}</p>
      <div className="mb-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {completed}
          <span className="text-base font-medium text-zinc-400"> / {goal}</span>
        </p>
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
          {percent}%
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
