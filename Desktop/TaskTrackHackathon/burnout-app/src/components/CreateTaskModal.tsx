'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, TaskType } from '@/store/useAppStore';
import { Plus, Repeat, X } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addTask } = useAppStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('Focus');
  const [isRecurring, setIsRecurring] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState('60');

  const reward = type === 'Focus' ? parseInt(durationMinutes || '0') * 3 : parseInt(durationMinutes || '0') * 1;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !durationMinutes) return;
    
    addTask({
      id: crypto.randomUUID(),
      title: title.trim(),
      type,
      isRecurring,
      completed: false,
      durationMinutes: parseInt(durationMinutes),
      reward,
    });
    
    setTitle('');
    setIsRecurring(false);
    setDurationMinutes('60');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-surface border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">New Mission</h2>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" 
                  placeholder="What needs to be done?" 
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Type</label>
                  <select 
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                    value={type}
                    onChange={(e) => setType(e.target.value as TaskType)}
                  >
                    <option value="Focus">Focus</option>
                    <option value="Recharge">Recharge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Est. Minutes</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer text-gray-300 hover:text-white transition-colors p-3 rounded-lg border border-gray-800 bg-black">
                  <input 
                    type="checkbox" 
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-700 text-accent focus:ring-accent bg-transparent"
                  />
                  <div className={`p-1 rounded ${isRecurring ? 'bg-accent/20 text-accent' : 'bg-gray-800 text-gray-500'}`}>
                    <Repeat size={16} />
                  </div>
                  <span className="font-medium">Repeat Everyday</span>
                </label>

                <div className="text-right">
                  <span className="text-xs text-gray-400 font-bold uppercase block">Reward</span>
                  <span className="text-xl text-accent font-black">+{reward} 💰</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-accent text-black font-bold p-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={18} /> Create Mission
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
