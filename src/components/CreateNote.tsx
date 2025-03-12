import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Upload } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

export function CreateNote({ selectedSubject }: { selectedSubject: Subject | null }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to create notes');
        return;
      }

      const { error } = await supabase.from('notes').insert([{
        title,
        content,
        is_public: isPublic,
        user_id: user.id,
        subject_id: selectedSubject?.id || null
      }]);

      if (error) throw error;

      setTitle('');
      setContent('');
      setIsPublic(false);

    } catch (error) {
      alert('Error creating note');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg mx-auto">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
        />
      </div>
    
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
        />
      </div>
    
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isPublic" className="ml-2 block text-base text-gray-900">
          Make this note public
        </label>
      </div>
    
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? (
          <Upload className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Plus className="h-5 w-5 mr-2" />
        )}
        {loading ? 'Creating...' : 'Create Note'}
      </button>
    </form>
  );
}