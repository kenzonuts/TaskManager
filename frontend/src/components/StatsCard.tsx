import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  filter?: string;
}

export const StatsCard = ({ title, value, icon: Icon, filter }: StatsCardProps) => {
  const content = (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm text-zinc-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-zinc-900">{value}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-3 text-white">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );

  if (filter) {
    return <Link to={`/tasks?filter=${filter}`}>{content}</Link>;
  }

  return content;
};
