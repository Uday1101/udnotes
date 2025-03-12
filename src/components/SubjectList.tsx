import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FolderOpen, Plus } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export function SubjectList({ onSelectSubject }: { onSelectSubject: (subject: Subject | null) => void }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching subjects:', error);
    } else {
      setSubjects(data || []);
    }
    setLoading(false);
  }

  async function handleCreateSubject(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase.from('subjects').insert([
      {
        name: newSubject.name,
        description: newSubject.description,
        user_id: user.id
      }
    ]);

    if (error) {
      console.error('Error creating subject:', error);
    } else {
      setNewSubject({ name: '', description: '' });
      setShowForm(false);
      fetchSubjects();
    }
  }

  if (loading) {
    return <div>Loading subjects...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Subjects</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-indigo-600 hover:text-indigo-800 p-2 -m-2"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateSubject} className="space-y-3 bg-white p-4 rounded-lg shadow">
          <div>
            <input
              type="text"
              placeholder="Subject Name"
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-base"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={newSubject.description}
              onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-base"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 text-base"
          >
            Create Subject
          </button>
        </form>
      )}

      <div className="space-y-2">
        <button
          onClick={() => onSelectSubject(null)}
          className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-100 flex items-center space-x-3"
        >
          <FolderOpen className="h-5 w-5 text-gray-500" />
          <span className="text-base">All Notes</span>
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject)}
            className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-100 flex items-center space-x-3"
          >
            <FolderOpen className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="font-medium text-base">{subject.name}</div>
              {subject.description && (
                <div className="text-sm text-gray-500">{subject.description}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}