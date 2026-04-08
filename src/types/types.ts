import type { PlayerSetup } from "../engine/game";
import type { StrategyFn } from "../engine/strategies";


export interface GameConfig {
    deck: string[];
    playersSetup: PlayerSetup[];
    winAt: number // Total score that allows a player to win
}

type PlayerStrategyConfig =
  | { type: 'alwaysHit' }
  | { type: 'stayAtCardCount'; threshold: number }
  | { type: 'stayAtHandTotal'; threshold: number }

export interface Player {
    busted: boolean;
    cards: string[];
    flip7wins: number;
    id: string;
    name: string;
    score: number;
    // strategy: StrategyFn | null; // This needs to be something else..
    // strategy: {
    //     type: 'alwaysHit' | 'stayAtCardCount' | 'stayAtHandTotal' // Need to make this it's own type I guess
    //     threshold?: number;
    //     strategyFn?: StrategyFn;
    // }
    strategy: StrategyFn;
    threshhold?: number;
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