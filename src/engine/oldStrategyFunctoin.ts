import { sumArray } from "../utilities/sum";

interface StrategyPerPlayer {
    stayOnCardCount?: number; // Number of Cards
    stayOnHandCount?: number; // Total value of cards in hand.
}

interface StrategyConfig {
    allAlwaysHit: boolean; // Default should be false
    allStayOnNumber?: number; // optional -- if hand.length === to this, stay.
    allStayOnTotal?: number; // *optional* -- if hand is >= this number, stay.
    playerStrategy?: Record<string, StrategyPerPlayer>;
}

const strategyConfig: StrategyConfig = {
    allAlwaysHit: false,
    // allStayOnNumber: 4,
    // allStayOnTotal: 30,
    playerStrategy: {
        'Player 1': { stayOnCardCount: 2, stayOnHandCount: 99 },
        'Player 2': { stayOnCardCount: 3, stayOnHandCount: 99 },
        'Player 3': { stayOnCardCount: 4, stayOnHandCount: 99 },
        'Player 4': { stayOnCardCount: 5, stayOnHandCount: 99 },
        'Player 5': { stayOnCardCount: 6, stayOnHandCount: 99 },
        // 'Player 6': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 7': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 8': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 9': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 10': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 11': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 12': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 13': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 14': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 15': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 16': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 17': { stayOnCardCount: 4, stayOnHandCount: 30 },
        // 'Player 18': { stayOnCardCount: 4, stayOnHandCount: 30 },
    }
}

interface StrategyInput {
    hand: string[];
    playerName: string;
    otherHands: string[][];
    discardPile: string[];
    position: number; // Position in game. Dealer = 0, then next player = 1, etc.  This changes every round.
}

type StrategyOutput = 'hit' | 'stay';

                // playerDecision is either "hit" or "stay" *before* drawing a card.
                // const playerDecision = strategy({ 
                //     hand: player.cards, 
                //     playerName: player.name,
                //     otherHands: players.filter((p) => p.name !== player.name).map((pl) => pl.cards),
                //     discardPile: discardPile,
                //     position: players.findIndex((p) => p.name === player.name)
                // });

function strategy ({ hand, playerName, otherHands, discardPile, position} : StrategyInput): StrategyOutput {

    // Forced Decision 1: If "allAlwaysHit" is true... keep hitting
    if (strategyConfig.allAlwaysHit) { return 'hit' };

    // Forced Decision 2: If "allStayOnTotal" is not undefined, return "stay" if >= number
    if (strategyConfig.allStayOnTotal) {
        if (sumArray(hand) >= strategyConfig.allStayOnTotal) { return 'stay' } else { return 'hit' };
    }

    // Forced Decision 3: If "allStayOnNumber" is not undefined, hit until that number is reached.
    if (strategyConfig.allStayOnNumber !== undefined) {
        console.log('handLength:', hand.length)
        if (hand.length === strategyConfig.allStayOnNumber) { return 'stay' } else { return 'hit' };
    }

    // Individual Player Forced Decision 1: If player's hand has the card count, stay
    if (strategyConfig.playerStrategy && strategyConfig.playerStrategy?.[playerName].stayOnCardCount) {
        if (hand.length === strategyConfig.playerStrategy?.[playerName].stayOnCardCount) {
            return 'stay'
        }
    }

    // Individual Player Forced Decisions 
    if (strategyConfig.playerStrategy && strategyConfig.playerStrategy?.[playerName].stayOnHandCount) {
        if (sumArray(hand) >= strategyConfig.playerStrategy?.[playerName].stayOnHandCount) {
            return 'stay'
        }
    }

    // Needs to return "hit" or "stay".
    return 'hit'
}
