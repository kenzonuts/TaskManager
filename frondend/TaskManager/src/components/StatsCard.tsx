import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  filter?: string;
}

export const StatsCard = ({ title, value, icon: Icon, color, bgColor, filter }: StatsCardProps) => {
  const content = (
    <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-xl`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (filter) {
    return (
      <Link to={`/tasks?filter=${filter}`}>
        {content}
      </Link>
    );
  }

  return content;
};
