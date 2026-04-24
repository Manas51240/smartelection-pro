import { create } from 'zustand';

/**
 * Interface representing the user's demographic context.
 */
interface UserContext {
  age: number | null;
  state: string;
  status: 'unregistered' | 'registered' | 'unknown';
}

/**
 * Interface representing the application's global state.
 */
interface AppState {
  context: UserContext;
  setContext: (context: Partial<UserContext>) => void;
}

export const useStore = create<AppState>((set) => ({
  context: {
    age: null,
    state: '',
    status: 'unknown',
  },
  setContext: (newContext) => set((state) => ({ 
    context: { ...state.context, ...newContext } 
  })),
}));
