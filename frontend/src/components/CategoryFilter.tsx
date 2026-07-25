import { Category } from '../types';
import { Folder, Grid } from 'lucide-react';
import { CreateCategoryButton } from './CreateCategoryButton';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  taskCounts: Record<string, number>;
  onCategoryCreated: (category: Category) => void;
}

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelectCategory,
  taskCounts,
  onCategoryCreated,
}: CategoryFilterProps) => {
  const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Folder className="w-5 h-5" />
        Categories
      </h2>

      <div className="space-y-2">
        <div className="pb-4 border-b border-white/10">
          <CreateCategoryButton onCategoryCreated={onCategoryCreated} />
        </div>

        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
            selectedCategory === null
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Grid className="w-4 h-4" />
            <span className="font-medium">All Tasks</span>
          </div>
          <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${
              selectedCategory === null
                ? 'bg-cyan-500/30 text-cyan-200'
                : 'bg-slate-500/20 text-slate-400'
            }`}
          >
            {totalTasks}
          </span>
        </button>

        {categories.map((category) => (
          <button
            key={category.categoryId}
            onClick={() => onSelectCategory(category.categoryId)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
              selectedCategory === category.categoryId
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Folder className="w-4 h-4" />
              <span className="font-medium">{category.name}</span>
            </div>
            <span
              className={`px-2 py-1 rounded-md text-xs font-semibold ${
                selectedCategory === category.categoryId
                  ? 'bg-cyan-500/30 text-cyan-200'
                  : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {taskCounts[category.categoryId] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
