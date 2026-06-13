'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { History as HistoryIcon, Trash2, Edit2, Loader2, Save, X, AlertCircle } from 'lucide-react';
import { TaskType } from '@/store/useAppStore';

interface Session {
  id: string;
  type: TaskType;
  durationMinutes: number;
  completedAt: string;
}

export default function HistoryTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDuration, setEditDuration] = useState<number>(0);

  const fetchSessions = async () => {
    try {
      const q = query(collection(db, 'sessions'), orderBy('completedAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Session[];
      setSessions(data);
      setError(null);
    } catch (e: any) {
      console.error(e);
      if (e.code === 'permission-denied') {
        setError('Firebase Permission Denied. Please ensure your Firestore security rules are set to allow reads and writes (e.g., `allow read, write: if true;` for testing).');
      } else {
        setError(e.message || 'Failed to load history.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    try {
      await deleteDoc(doc(db, 'sessions', id));
      setSessions(sessions.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditStart = (session: Session) => {
    setEditingId(session.id);
    setEditDuration(session.durationMinutes);
  };

  const handleEditSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'sessions', id), {
        durationMinutes: editDuration
      });
      setSessions(sessions.map(s => s.id === id ? { ...s, durationMinutes: editDuration } : s));
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

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
          onClick={async () => {
            setIsLoading(true);
            try {
              const { addDoc } = await import('firebase/firestore');
              const types: TaskType[] = ['Focus', 'Recharge'];
              for(let i=0; i<5; i++) {
                const randomTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
                await addDoc(collection(db, 'sessions'), {
                  type: types[Math.floor(Math.random() * types.length)],
                  durationMinutes: Math.floor(Math.random() * 45) + 15,
                  completedAt: randomTime.toISOString(),
                  title: `Generated Task ${i+1}`
                });
              }
              await fetchSessions();
            } catch(e) { console.error(e); }
          }}
          className="bg-gray-800 hover:bg-gray-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors border border-gray-700 text-white"
        >
          + Generate Mock Data
        </button>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-4">
          <AlertCircle className="text-red-500 shrink-0 mt-1" />
          <div>
            <h4 className="text-red-500 font-bold">Error Loading History</h4>
            <p className="text-sm text-red-200 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : sessions.length === 0 && !error ? (
          <div className="flex items-center justify-center flex-1 text-gray-500">
            No completed sessions yet.
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
                              <button onClick={() => handleEditStart(session)} className="p-1.5 text-gray-500 hover:text-white transition-colors"><Edit2 size={16} /></button>
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
