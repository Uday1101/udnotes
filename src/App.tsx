import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { CreateNote } from './components/CreateNote';
import { NoteList } from './components/NoteList';
import { SubjectList } from './components/SubjectList';
import { StickyNote, LogOut } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

function App() {
  const [session, setSession] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <StickyNote className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">UD Notes</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">{session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-64">
              <SubjectList onSelectSubject={setSelectedSubject} />
            </div>
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedSubject ? `Create Note in ${selectedSubject.name}` : 'Create New Note'}
                </h2>
                <CreateNote selectedSubject={selectedSubject} />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedSubject ? `Notes in ${selectedSubject.name}` : 'All Notes'}
                </h2>
                <NoteList selectedSubject={selectedSubject} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App