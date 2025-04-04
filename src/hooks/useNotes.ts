import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  bookKey: string;
  cfiRange: string;
  text: string;
  noteText: string;
  createdAt: number;
  updatedAt: number;
}

export const useNotes = (bookKey: string | null) => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!bookKey) return;
    loadNotes();
  }, [bookKey]);

  const loadNotes = () => {
    if (!bookKey) return;
    
    try {
      const savedNotes = localStorage.getItem(`book-notes-${bookKey}`);
      console.log('Loading notes for book:', bookKey, 'Found:', savedNotes);
      
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        console.log('Parsed notes:', parsedNotes);
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    if (!bookKey) return;
    
    try {
      console.log('Saving notes:', updatedNotes);
      localStorage.setItem(`book-notes-${bookKey}`, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const addNote = (cfiRange: string, text: string, noteText: string) => {
    if (!bookKey) return null;
    
    const now = Date.now();
    const newNote: Note = {
      id: uuidv4(),
      bookKey,
      cfiRange,
      text,
      noteText,
      createdAt: now,
      updatedAt: now
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    
    return newNote;
  };

  const updateNote = (id: string, noteText: string) => {
    if (!bookKey) return;
    
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, noteText, updatedAt: Date.now() } 
        : note
    );
    
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const removeNote = (id: string) => {
    if (!bookKey) return;
    
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  return {
    notes,
    addNote,
    updateNote,
    removeNote
  };
};
