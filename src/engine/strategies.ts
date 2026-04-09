import { sumArray } from "../utilities/sum";


export interface DecisionInput {
    deck: string[];
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


export function cardCounting(riskThreshold: number): StrategyFn {

    return (input) => {
        let numberOfDangerousCardsInDeck: number = 0;
        input.hand.forEach((card) => {
            for (let i = 0; i < input.deck.length; i++) {
                if (card === input.deck[i]) {
                    numberOfDangerousCardsInDeck++
                }
            }
        })

        const percentChanceToBust = (numberOfDangerousCardsInDeck / input.deck.length) * 100;

        if (percentChanceToBust >= riskThreshold) { 
            return 'stay' 
        } else {
            return 'hit'
        }
    }
}