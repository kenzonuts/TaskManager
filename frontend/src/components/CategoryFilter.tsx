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
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900">
        <Folder className="h-5 w-5" />
        Categories
      </h2>

      <div className="space-y-2">
        <div className="border-b border-zinc-100 pb-4">
          <CreateCategoryButton onCategoryCreated={onCategoryCreated} />
        </div>

        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors ${
            selectedCategory === null
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Grid className="h-4 w-4" />
            <span className="font-medium">All Tasks</span>
          </div>
          <span
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              selectedCategory === null
                ? 'bg-white/20 text-white'
                : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {totalTasks}
          </span>
        </button>

        {categories.map((category) => (
          <button
            type="button"
            key={category.categoryId}
            onClick={() => onSelectCategory(category.categoryId)}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors ${
              selectedCategory === category.categoryId
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Folder className="h-4 w-4" />
              <span className="font-medium">{category.name}</span>
            </div>
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                selectedCategory === category.categoryId
                  ? 'bg-white/20 text-white'
                  : 'bg-zinc-100 text-zinc-600'
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
