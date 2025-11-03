import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '@aura/shared';

interface MessageStore {
  messages: Message[];
  addMessage: (content: string, isFromMe: boolean, emoji?: string) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set) => ({
      messages: [],

      addMessage: (content, isFromMe, emoji) => {
        const newMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: content.trim(),
          createdAt: new Date().toISOString(),
          isFromMe,
          emoji,
        };

        console.log('[MessageStore] Creating new message:', JSON.stringify(newMessage, null, 2));

        set((state) => {
          const updatedMessages = [...state.messages, newMessage];
          console.log('[MessageStore] State before update:', state.messages.length);
          console.log('[MessageStore] State after update:', updatedMessages.length);
          console.log('[MessageStore] Full messages array:', JSON.stringify(updatedMessages, null, 2));
          return { messages: updatedMessages };
        });
      },

      deleteMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        }));

        console.log('[MessageStore] Deleted message:', id);
      },

      clearMessages: () => {
        set({ messages: [] });
        console.log('[MessageStore] Cleared all messages');
      },
    }),
    {
      name: 'aura-message-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
