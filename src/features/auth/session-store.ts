/**
 * @fileoverview Lightweight client-side session state for the mobile prototype.
 * @remarks The API-backed authentication flow will replace the demo login action.
 */

import { create } from 'zustand';

type SessionState = {
  displayName: string;
  isAuthenticated: boolean;
  signIn: (displayName: string) => void;
  signOut: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  displayName: 'Ama Mensah',
  isAuthenticated: false,
  signIn: (displayName) => set({ displayName, isAuthenticated: true }),
  signOut: () => set({ displayName: '', isAuthenticated: false }),
}));
