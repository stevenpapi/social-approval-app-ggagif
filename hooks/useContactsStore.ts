
import { useState, useCallback, useEffect } from 'react';
import { Contact } from '@/types/post';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_STORAGE_KEY = 'social_contacts';

export const useContactsStore = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        // Initialize with some demo contacts
        const demoContacts: Contact[] = [
          { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
          { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
          { id: '3', name: 'Carol White', email: 'carol@example.com' },
        ];
        await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(demoContacts));
        setContacts(demoContacts);
      }
    } catch (error) {
      console.log('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addContact = useCallback((name: string, email?: string, phoneNumber?: string) => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      email,
      phoneNumber,
    };
    const updated = [...contacts, newContact];
    AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updated));
    setContacts(updated);
    return newContact;
  }, [contacts]);

  const deleteContact = useCallback((id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updated));
    setContacts(updated);
  }, [contacts]);

  return {
    contacts,
    isLoading,
    addContact,
    deleteContact,
  };
};
