import { create } from 'zustand';
import { ChatSummary } from '../types';

interface ChatSummaryStore {
  list: ChatSummary[];
  addList: (list: ChatSummary[]) => void;
  setList: (list: ChatSummary[]) => void;
  updateList: (newList: ChatSummary) => void;
  clearList: () => void;
}

const useChatSummaryStore = create<ChatSummaryStore>((set, get) => ({
    list: [],
    addList: (newList: ChatSummary[]) => {
        set({
            list: [ ...newList, ...get().list ]
        });
    },
    setList: (list: ChatSummary[]) => {
        set({ list });
    },
    updateList: (newList: ChatSummary) => {
        set((state) => ({
            list: state.list.map((item) => item.id === newList.id ? { ...item, ...newList } : item)
        }));
    },
    clearList: () => {
        set({ list: [] });
    }
}));

export default useChatSummaryStore;
