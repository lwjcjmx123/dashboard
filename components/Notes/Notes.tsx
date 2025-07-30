import React, { useState } from 'react';
import { Plus, Search, Tag, Calendar, Edit3, Trash2, Archive, FileText } from 'lucide-react';
import { useClientNotes } from '@/lib/client-data-hooks';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/utils/dateUtils';
import { marked } from 'marked';

const Notes: React.FC = () => {
  const { notes, loading, error, createNote, updateNote, deleteNote } = useClientNotes();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    tagInput: '',
  });

  const allTags = Array.from(new Set(notes.flatMap((note: any) => note.tags?.map((tag: any) => tag.name) || []))) as string[];
  
  const filteredNotes = notes.filter((note: any) => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || note.tags?.some((tag: any) => tag.name === selectedTag);
    const matchesArchived = showArchived || !note.archived;
    
    return matchesSearch && matchesTag && matchesArchived;
  });

  const handleSelectNote = (note: any) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags?.map((tag: any) => tag.name) || [],
      tagInput: '',
    });
    setIsEditing(false);
  };

  const handleNewNote = async () => {
    try {
      const newNote = await createNote({
        title: t('newNote'),
        content: '',
        tags: [],
      });
      
      setSelectedNote(newNote);
      setNoteForm({
        title: newNote.title,
        content: newNote.content,
        tags: [],
        tagInput: '',
      });
      setIsEditing(true);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote || !noteForm.title) return;
    
    try {
      const updatedNote = await updateNote({
        id: selectedNote.id,
        title: noteForm.title,
        content: noteForm.content,
        tags: noteForm.tags,
      });
      
      setSelectedNote(updatedNote);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (note: any) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(note.id);
        
        if (selectedNote?.id === note.id) {
          setSelectedNote(null);
          setNoteForm({ title: '', content: '', tags: [], tagInput: '' });
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleArchiveNote = async (note: any) => {
    try {
      const updatedNote = await updateNote({
        id: note.id,
        archived: !note.archived,
      });
      
      if (selectedNote?.id === note.id) {
        setSelectedNote(updatedNote);
      }
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const handleAddTag = () => {
    if (noteForm.tagInput.trim() && !noteForm.tags.includes(noteForm.tagInput.trim())) {
      setNoteForm({
        ...noteForm,
        tags: [...noteForm.tags, noteForm.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNoteForm({
      ...noteForm,
      tags: noteForm.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const renderMarkdown = (content: string) => {
    try {
      return { __html: marked(content) };
    } catch (error) {
      return { __html: content };
    }
  };

  if (loading) return <div className="p-6">{t('loadingNotes')}</div>;
  if (error) return <div className="p-6">{t('errorLoadingNotes')}: {error.message}</div>;

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Notes List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('notes')}
            </h2>
            <button
              onClick={handleNewNote}
              className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <Plus size={16} />
              {t('newNote')}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={t('searchNotes')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show archived
              </span>
            </label>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center">
              <FileText className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedTag ? 'No notes found' : t('noRecentNotes')}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredNotes.map((note: any) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedNote?.id === note.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${note.archived ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate flex-1">
                      {note.title}
                    </h3>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveNote(note);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        <Archive size={14} className="text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {note.content || 'No content'}
                  </p>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.slice(0, 3).map((tag: any, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400 text-xs rounded-full"
                        >
                          <Tag size={10} />
                          {tag.name}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(new Date(note.updatedAt), '24')}
                    </span>
                    {note.archived && (
                      <span className="text-orange-500 dark:text-orange-400 font-medium">
                        Archived
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Content - Note Editor/Viewer */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      className="text-xl font-bold w-full bg-transparent border-none outline-none text-gray-900 dark:text-white"
                      placeholder={t('noteTitle')}
                    />
                  ) : (
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedNote.title}
                    </h1>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Last updated: {formatDate(new Date(selectedNote.updatedAt), '24')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      >
                        {t('save')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                      <Edit3 size={16} />
                      {t('edit')}
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              {isEditing ? (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {noteForm.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400 text-xs rounded-full"
                      >
                        <Tag size={12} />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteForm.tagInput}
                      onChange={(e) => setNoteForm({ ...noteForm, tagInput: e.target.value })}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add a tag"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      {t('add')}
                    </button>
                  </div>
                </div>
              ) : (
                selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedNote.tags.map((tag: any, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full"
                      >
                        <Tag size={12} />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Note Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full h-full resize-none border-none outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder={t('noteContent')}
                />
              ) : (
                <div className="prose max-w-none prose-gray dark:prose-invert">
                  {selectedNote.content ? (
                    <div dangerouslySetInnerHTML={renderMarkdown(selectedNote.content)} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      This note is empty. Click Edit to add content.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Select a note to view
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a note from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;