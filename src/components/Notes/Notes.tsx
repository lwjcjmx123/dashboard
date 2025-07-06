import React, { useState } from 'react';
import { Plus, Search, Tag, Calendar, Edit3, Trash2, Archive, FileText } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Note } from '../../types';
import { formatDate, generateId } from '../../utils/dateUtils';
import { marked } from 'marked';

const Notes: React.FC = () => {
  const { state, dispatch } = useApp();
  const { notes, settings } = state;
  const isDark = settings.theme === 'dark';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    tagInput: '',
  });

  const allTags = [...new Set(notes.flatMap(note => note.tags))];
  
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    const matchesArchived = showArchived || !note.archived;
    
    return matchesSearch && matchesTag && matchesArchived;
  });

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags,
      tagInput: '',
    });
    setIsEditing(false);
  };

  const handleNewNote = () => {
    const newNote: Note = {
      id: generateId(),
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      linkedTasks: [],
      linkedEvents: [],
      archived: false,
    };
    
    dispatch({ type: 'ADD_NOTE', payload: newNote });
    setSelectedNote(newNote);
    setNoteForm({
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags,
      tagInput: '',
    });
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!selectedNote || !noteForm.title) return;
    
    const updatedNote: Note = {
      ...selectedNote,
      title: noteForm.title,
      content: noteForm.content,
      tags: noteForm.tags,
      updatedAt: new Date(),
    };
    
    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    setSelectedNote(updatedNote);
    setIsEditing(false);
  };

  const handleDeleteNote = (note: Note) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      dispatch({ type: 'DELETE_NOTE', payload: note.id });
      if (selectedNote?.id === note.id) {
        setSelectedNote(null);
        setNoteForm({ title: '', content: '', tags: [], tagInput: '' });
      }
    }
  };

  const handleArchiveNote = (note: Note) => {
    const updatedNote = { ...note, archived: !note.archived };
    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    if (selectedNote?.id === note.id) {
      setSelectedNote(updatedNote);
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

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Notes List */}
      <div className={`w-80 border-r ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      } flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notes
            </h2>
            <button
              onClick={handleNewNote}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={16} />
              New
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
                {searchTerm || selectedTag ? 'No notes found' : 'No notes yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedNote?.id === note.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : isDark
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
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
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full"
                        >
                          <Tag size={10} />
                          {tag}
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
                      {formatDate(new Date(note.updatedAt), settings.timeFormat)}
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
            <div className={`p-4 border-b ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      className={`text-xl font-bold w-full bg-transparent border-none outline-none ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                      placeholder="Note title"
                    />
                  ) : (
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedNote.title}
                    </h1>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Last updated: {formatDate(new Date(selectedNote.updatedAt), settings.timeFormat)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Edit3 size={16} />
                      Edit
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
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full"
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
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Add a tag"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                selectedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full"
                      >
                        <Tag size={12} />
                        {tag}
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
                  className={`w-full h-full resize-none border-none outline-none ${
                    isDark 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Write your note here... (Markdown supported)"
                />
              ) : (
                <div className={`prose max-w-none ${
                  isDark ? 'prose-invert' : ''
                }`}>
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