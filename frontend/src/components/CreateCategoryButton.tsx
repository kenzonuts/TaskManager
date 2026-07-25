import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';
import { Plus, X } from 'lucide-react';
import { createCategory } from '../api/categories';

interface CreateCategoryButtonProps {
  onCategoryCreated: (category: Category) => void;
}

export const CreateCategoryButton = ({ onCategoryCreated }: CreateCategoryButtonProps) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || !user) return;

    setError('');
    setIsLoading(true);

    try {
      const result = await createCategory(categoryName.trim());
      onCategoryCreated({
        categoryId: result.id,
        name: categoryName.trim(),
        userId: user.userId,
        tasks: [],
      });
      setCategoryName('');
      setIsModalOpen(false);
    } catch {
      setError('Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-zinc-800"
      >
        <Plus className="h-4 w-4" />
        <span>Create Category</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Create New Category</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="categoryName"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Category Name
                </label>
                <input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  placeholder="Enter category name"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-zinc-700 transition-colors hover:bg-zinc-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !categoryName.trim()}
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
