interface WeeklyProgressRingProps {
  completed: number;
  goal: number;
  percent: number;
}

export const WeeklyProgressRing = ({
  completed,
  goal,
  percent,
}: WeeklyProgressRingProps) => {
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#18181b"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold tabular-nums text-zinc-900">
            {percent}%
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-900">Weekly Progress</p>
        <p className="mt-1 text-xs text-zinc-500">
          {completed} / {goal} tasks this week
        </p>
      </div>
    </div>
  );
};
