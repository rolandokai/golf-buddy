// app/stores/useGamesStore.ts
'use client';

import { create } from 'zustand';

export interface Player {
    name: string;
    handicap: number;
}

export interface GameData {
    id: number;
    courseId: number;
    players: Player[];
    startingHole: number;
    // 2D matrix: strokesGiven[giverIndex][receiverIndex] = # of strokes
    strokesGiven: number[][];
    scores: string[][];
}

interface GamesState {
    games: GameData[];
    loadGames: () => void;
    addGame: (game: GameData) => void;
    updateGame: (game: GameData) => void;
    deleteGame: (gameId: number) => void;
}

const useGamesStore = create<GamesState>((set, get) => ({
    games: [],
    loadGames: () => {
        const stored = localStorage.getItem('games');
        if (stored) {
            set({ games: JSON.parse(stored) });
        }
    },
    addGame: (game) => {
        const updated = [...get().games, game];
        localStorage.setItem('games', JSON.stringify(updated));
        set({ games: updated });
    },
    updateGame: (game) => {
        const updated = get().games.map((g) => (g.id === game.id ? game : g));
        localStorage.setItem('games', JSON.stringify(updated));
        set({ games: updated });
    },
    deleteGame: (gameId) => {
        const updated = get().games.filter((g) => g.id !== gameId);
        localStorage.setItem('games', JSON.stringify(updated));
        set({ games: updated });
    },
}));

export default useGamesStore;
