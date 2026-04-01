

export interface GameConfig {
    deck: string[];
    hardStayAt?: number;  // For simulations that want a hard stay for every player
    numberOfPlayers: number; // Later possibly a Player Type
    winAt: number // Total score that allows a player to win
}

export interface Player {
    busted: boolean;
    cards: string[];
    flip7wins: number;
    name: string;
    score: number;
    turnComplete: boolean;
    wins: number;
}

// ===== Bust Types =====
export type BustByCardNumber = Record<number, number>;

export interface BustByHandSizeEntry {
    drawn: number;
    busts: number;
    percentage?: string;
}

export type BustByHandSize = Record<number, BustByHandSizeEntry>;

export interface BustResults {
    bustByCardNumber: BustByCardNumber;
    bustByHandSize: BustByHandSize;
}

// ===== Flip7 Types =====
export interface Flip7Results {
    flip7wins: number;
    percentageChanceOverall: string;
    percentageChancePerPlayer: string;
}

// ===== Player Types =====
export interface PlayerResult {
    flip7wins: number;
    name: string;
    wins: number;
}

// ===== Final Result Types =====
export interface Results {
    bustResults: BustResults;
    flip7Results: Flip7Results;
    numberOfGamesRan: number;
    playerResults: Record<string, PlayerResult>;
    totalRounds: number;
}