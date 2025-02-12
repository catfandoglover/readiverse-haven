import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

interface ReadingList {
  id: string;
  name: string;
  books: string[];
  createdAt: Date;
}

interface ReadingProgress {
  bookId: string;
  position: number;
  timestamp: Date;
  deviceId: string;
}

const COOKIE_KEYS = {
  READING_LISTS: 'reading_lists',
  READING_PROGRESS: 'reading_progress',
  DEVICE_ID: 'device_id'
};

export const useLibraryStorage = () => {
  // Generate or retrieve device ID
  const getDeviceId = () => {
    let deviceId = Cookies.get(COOKIE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = uuidv4();
      Cookies.set(COOKIE_KEYS.DEVICE_ID, deviceId, { expires: 365 });
    }
    return deviceId;
  };

  // Reading Lists
  const getReadingLists = (): ReadingList[] => {
    const lists = Cookies.get(COOKIE_KEYS.READING_LISTS);
    return lists ? JSON.parse(lists) : [];
  };

  const saveReadingList = (list: Omit<ReadingList, 'id' | 'createdAt'>) => {
    const lists = getReadingLists();
    const newList = {
      ...list,
      id: uuidv4(),
      createdAt: new Date(),
    };
    lists.push(newList);
    Cookies.set(COOKIE_KEYS.READING_LISTS, JSON.stringify(lists), { expires: 365 });
    return newList;
  };

  // Reading Progress
  const getReadingProgress = (bookId: string): ReadingProgress | null => {
    const progress = Cookies.get(COOKIE_KEYS.READING_PROGRESS);
    if (!progress) return null;
    
    const allProgress: ReadingProgress[] = JSON.parse(progress);
    return allProgress.find(p => p.bookId === bookId) || null;
  };

  const saveReadingProgress = (bookId: string, position: number) => {
    const progress = Cookies.get(COOKIE_KEYS.READING_PROGRESS);
    const allProgress: ReadingProgress[] = progress ? JSON.parse(progress) : [];
    
    const newProgress: ReadingProgress = {
      bookId,
      position,
      timestamp: new Date(),
      deviceId: getDeviceId(),
    };

    const existingIndex = allProgress.findIndex(p => p.bookId === bookId);
    if (existingIndex >= 0) {
      allProgress[existingIndex] = newProgress;
    } else {
      allProgress.push(newProgress);
    }

    Cookies.set(COOKIE_KEYS.READING_PROGRESS, JSON.stringify(allProgress), { expires: 365 });
    return newProgress;
  };

  return {
    getDeviceId,
    getReadingLists,
    saveReadingList,
    getReadingProgress,
    saveReadingProgress,
  };
};