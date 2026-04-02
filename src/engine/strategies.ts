import { sumArray } from "../utilities/sum";


export interface DecisionInput {
    hand: string[];
    // discardPile: string[];
    // playerScore: number;
    // opponentScores: number[];
}

export type Decision = 'hit' | 'stay';

// This is the key line. A "Strategy" is just a function shape.
export type StrategyFn = (input: DecisionInput) => Decision;


// Always 'hit' no matter what
export function alwaysHit(): StrategyFn {
    return (_input) => 'hit'
}

// Hit until number of cards in player hand reaches threshold
export function stayAtCardCount(threshold: number): StrategyFn {
    return (input) => input.hand.length >= threshold ? 'stay' : 'hit';
}

// Hit until *SUM* of cards in hand reaches threshold
export function stayAtHandTotal(threshold: number): StrategyFn {
    return (input) => sumArray(input.hand) >= threshold ? 'stay' : 'hit';
}