import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';
import { CreateCategoryButton } from '../components/CreateCategoryButton';
import { Folder, Edit, Trash2, CheckCircle2, Loader2 } from 'lucide-react';

export const Categories = () => {
  const { user, getAuthToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;

      try {
        const token = getAuthToken();
        const response = await fetch('http://localhost:5091/api/Categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          const categoriesData: Category[] = await response.json();
          setCategories(categoriesData);
        } else {
          console.error('Failed to fetch categories:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user, getAuthToken]);

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
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5091/api/Categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          categoryId: categoryId,
          name: editName.trim(),
        }),
      });

      if (response.ok) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.categoryId === categoryId ? { ...cat, name: editName.trim() } : cat
          )
        );
        setEditingCategory(null);
        setEditName('');
      } else {
        console.error('Failed to update category:', response.status);
        alert('Failed to update category. Please try again.');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please try again.');
    } finally {
      setSavingCategory(null);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?".')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5091/api/Categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat.categoryId !== categoryId));
      } else {
        let errorMessage = 'Gagal menghapus kategori karena masih ada task yang menumpuk.';
        if (response.status === 400) {
          try {
            const errorData = await response.json();
            if (errorData.message && errorData.message.toLowerCase().includes('unfinished') || errorData.message.toLowerCase().includes('belum selesai')) {
              errorMessage = 'Tidak dapat menghapus kategori karena masih ada tugas yang belum selesai.';
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
        }
        console.error('Failed to delete category:', response.status);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error menghapus kategori. Silakan coba lagi.');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Categories</h2>
            <p className="text-slate-300">Kelola kategori tugas Anda</p>
          </div>

          <div className="max-w-2xl">
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
              <CreateCategoryButton onCategoryCreated={handleCategoryCreated} />
            </div>

            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-12 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl">
                  <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No categories found</p>
                  <p className="text-slate-500 text-sm mt-2">Create your first category to get started</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.categoryId}
                    className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Folder className="w-5 h-5 text-cyan-400" />
                        {editingCategory === category.categoryId ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(category.categoryId);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="text-white font-medium">{category.name}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {editingCategory === category.categoryId ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(category.categoryId)}
                              className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditCategory(category.categoryId, category.name)}
                              className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.categoryId)}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
};
