import { create } from 'zustand';

export type NavigationStack = 'onboarding' | 'setup_account' | 'home';

interface NavigationStore {
  activeStack: NavigationStack;
  isNavigating: boolean;
  setActiveStack: (stack: NavigationStack) => void;
  setNavigating: (state: boolean) => void;
  resetToOnboarding: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  activeStack: 'onboarding',
  isNavigating: false,
  
  setActiveStack: (stack: NavigationStack) =>
    set({ activeStack: stack }),
  
  setNavigating: (state: boolean) =>
    set({ isNavigating: state }),
  
  resetToOnboarding: () =>
    set({ activeStack: 'onboarding', isNavigating: false }),
}));