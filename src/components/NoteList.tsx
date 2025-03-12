import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Globe, Lock, Trash } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  created_at: string;
  user_id: string;
  subject: {
    name: string;
  } | null;
}

interface Subject {
  id: string;
  name: string;
}

export function NoteList({ selectedSubject }: { selectedSubject: Subject | null }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject]);

  async function fetchNotes() {
    const query = supabase
      .from('notes')
      .select(`
        *,
        subject:subject_id (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (selectedSubject) {
      query.eq('subject_id', selectedSubject.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  }

  async function deleteNote(id: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
    } else {
      setNotes(notes.filter(note => note.id !== id));
    }
  }

  if (loading) {
    return <div className="text-center">Loading notes...</div>;
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white rounded-lg shadow p-4 sm:p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{note.title}</h3>
              {note.subject && (
                <span className="text-sm text-gray-500">
                  Subject: {note.subject.name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {note.is_public ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{note.content}</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 gap-2">
            <span>
              Created {formatDistanceToNow(new Date(note.created_at))} ago
            </span>
            <button className="flex items-center text-indigo-600 hover:text-indigo-800">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}