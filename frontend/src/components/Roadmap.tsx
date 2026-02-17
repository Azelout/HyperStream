import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface RoadmapProps {
  mode: 'edit' | 'check';
}

export const Roadmap = ({ mode }: RoadmapProps) => {
  const { roadmap, updateRoadmapItem, addRoadmapItem, removeRoadmapItem, setRoadmapTitle } = useApp();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemTitle.trim()) {
      addRoadmapItem(newItemTitle.trim());
      setNewItemTitle('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white/90">Project Roadmap</h3>
        {mode === 'edit' && (
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="New milestone..."
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-neon-cyan/50 transition-colors w-40 sm:w-64"
            />
            <button
              type="submit"
              className="p-1.5 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {roadmap.map((item) => (
          <div
            key={item.id}
            className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
              item.completed
                ? 'bg-neon-cyan/5 border-neon-cyan/20'
                : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {mode === 'check' ? (
                <button
                  onClick={() => updateRoadmapItem(item.id, !item.completed)}
                  className={`transition-colors ${
                    item.completed ? 'text-neon-cyan' : 'text-gray-500 hover:text-neon-cyan'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <div className={item.completed ? 'text-neon-cyan' : 'text-gray-500'}>
                  {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
              )}

              {editingId === item.id && mode === 'edit' ? (
                <input
                  autoFocus
                  type="text"
                  value={item.title}
                  onChange={(e) => setRoadmapTitle(item.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                  className="bg-transparent border-b border-neon-cyan/50 text-white outline-none flex-1"
                />
              ) : (
                <span
                  className={`text-sm transition-all ${
                    item.completed ? 'text-gray-400 line-through' : 'text-white/90'
                  }`}
                >
                  {item.title}
                </span>
              )}
            </div>

            {mode === 'edit' && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingId(item.id)}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeRoadmapItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
