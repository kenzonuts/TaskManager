import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';
import { CreateCategoryButton } from '../components/CreateCategoryButton';
import { Folder, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import * as categoriesApi from '../api/categories';
import { ApiError } from '../api/client';

export const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      try {
        const categoriesData = await categoriesApi.getCategories();
        setCategories(categoriesData);
      } catch {
        // keep empty list on failure
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleEditCategory = (categoryId: string, currentName: string) => {
    setEditingCategory(categoryId);
    setEditName(currentName);
  };

  const handleSaveEdit = async (categoryId: string) => {
    if (!editName.trim()) return;
    setSavingCategory(categoryId);

    try {
      await categoriesApi.updateCategory(categoryId, editName.trim());
      setCategories((prev) =>
        prev.map((cat) =>
          cat.categoryId === categoryId ? { ...cat, name: editName.trim() } : cat
        )
      );
      setEditingCategory(null);
      setEditName('');
    } catch {
      alert('Failed to update category. Please try again.');
    } finally {
      setSavingCategory(null);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return;
    }

    try {
      await categoriesApi.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((cat) => cat.categoryId !== categoryId));
    } catch (error) {
      let errorMessage = 'Gagal menghapus kategori.';
      if (error instanceof ApiError) {
        const msg = error.message.toLowerCase();
        if (msg.includes('unfinished') || msg.includes('belum selesai')) {
          errorMessage = 'Tidak dapat menghapus kategori karena masih ada tugas yang belum selesai.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      alert(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-lg text-zinc-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Categories
        </h2>
        <p className="text-zinc-500">Organize tasks into groups that make sense.</p>
      </div>

      <div className="max-w-2xl">
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6">
          <CreateCategoryButton onCategoryCreated={handleCategoryCreated} />
        </div>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
              <Folder className="mx-auto mb-4 h-14 w-14 text-zinc-300" />
              <p className="text-lg font-medium text-zinc-800">No categories found</p>
              <p className="mt-1 text-sm text-zinc-500">
                Create your first category to get started
              </p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.categoryId}
                className="rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <Folder className="h-5 w-5 text-zinc-700" />
                    {editingCategory === category.categoryId ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(category.categoryId);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                        disabled={savingCategory === category.categoryId}
                      />
                    ) : (
                      <span className="font-medium text-zinc-900">{category.name}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {editingCategory === category.categoryId ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(category.categoryId)}
                          className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleEditCategory(category.categoryId, category.name)
                          }
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.categoryId)}
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
