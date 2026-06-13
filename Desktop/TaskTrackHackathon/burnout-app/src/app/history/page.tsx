'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { History as HistoryIcon, Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react';

export default function HistoryTab() {
  const { sessions, deleteSession, updateSession, generateMockSessions } = useAppStore();
  const [isClient, setIsClient] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDuration, setEditDuration] = useState<number>(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    deleteSession(id);
  };

  const handleEditStart = (id: string, durationMinutes: number) => {
    setEditingId(id);
    setEditDuration(durationMinutes);
  };

  const handleEditSave = (id: string) => {
    updateSession(id, editDuration);
    setEditingId(null);
  };

  if (!isClient) return null;

  return (
    <div className="max-w-4xl mx-auto pt-6 h-full flex flex-col gap-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <HistoryIcon className="text-accent" size={32} />
            Session History
          </h1>
          <p className="text-gray-400 mt-2">Review your past focuses and recharges.</p>
        </div>
        <button 
          onClick={() => generateMockSessions()}
          className="bg-gray-800 hover:bg-gray-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors border border-gray-700 text-white"
        >
          + Generate Mock Data
        </button>
      </header>

      <div className="bg-surface rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex-1 flex flex-col">
        {sessions.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-gray-500">
            No completed sessions yet. Click "Generate Mock Data" to populate.
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => {
                  const isEditing = editingId === session.id;
                  const date = new Date(session.completedAt);
                  
                  return (
                    <tr key={session.id} className="border-b border-gray-800/50 hover:bg-black/20 transition-colors group">
                      <td className="py-4 text-gray-300">
                        {date.toLocaleDateString()} <span className="text-gray-600 text-sm">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${session.type === 'Focus' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                          {session.type}
                        </span>
                      </td>
                      <td className="py-4">
                        {isEditing ? (
                          <input 
                            type="number"
                            className="bg-black border border-accent rounded px-2 py-1 w-20 text-white focus:outline-none"
                            value={editDuration}
                            onChange={(e) => setEditDuration(Number(e.target.value))}
                            autoFocus
                          />
                        ) : (
                          <span className="text-white font-medium">{session.durationMinutes} min</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleEditSave(session.id)} className="p-1.5 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"><Save size={16} /></button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"><X size={16} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditStart(session.id, session.durationMinutes)} className="p-1.5 text-gray-500 hover:text-white transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(session.id)} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
