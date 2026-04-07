import type { BustResults, GameConfig, Player, Results } from "../types/types";
import { shuffle } from "../utilities/shuffle";
import { sumArray } from "../utilities/sum";
import { alwaysHit, type Decision, type DecisionInput } from "./strategies";

interface RunSimulationInput {
    deck: string[];
    numberOfGames: number;
    numberOfPlayers: number;
    strategy: 'alwaysHit' | 'stayAtCardCount' | 'stayAtHandTotal';
    threshold?: number;
    winAt: number; // Default for Flip7 is 200
}

export function runSimulation({
    deck,
    numberOfGames,
    numberOfPlayers,
    strategy,
    threshold,
    winAt
}: RunSimulationInput) {
    const start = performance.now(); // For performance measuring
    const results = createResultObject();

    // Play numberOfGames, keeps track of results
    for (let i = 0; i < numberOfGames; i++) {

        let gameResult = runGame({ deck, numberOfPlayers, winAt });
            

        // Add 1 to number of games ran
        results.numberOfGamesRan++;

        // Add all rounds run per game into a total rounds run for all games.
        results.totalRounds += gameResult.roundsCounter;

        // Add bust results to results object
        Object.entries(gameResult.bustResults.bustByHandSize).forEach(([key, value]) => {
            const numKey = Number(key);
            if (!results.bustResults.bustByHandSize[numKey]) {
                results.bustResults.bustByHandSize[numKey] = { drawn: value.drawn, busts: value.busts, percentage: ''};
                return;
            }

            results.bustResults.bustByHandSize[numKey].drawn += value.drawn;
            results.bustResults.bustByHandSize[numKey].busts += value.busts;
        })

        Object.entries(gameResult.bustResults.bustByCardNumber).forEach(([key, value]) => {
            const numKey = Number(key);
            if (!results.bustResults.bustByCardNumber[numKey]) {
                results.bustResults.bustByCardNumber[numKey] = value;
                return;
            }

            results.bustResults.bustByCardNumber[numKey] += value;
        })

        // Loop through gameResult.players and update results.playerResults object.
        gameResult.players.forEach((player) => {
            // Update associated player in results.playerResults
            if (!results.playerResults[player.name]) {
                results.playerResults[player.name] = { flip7wins: 0, name: player.name, wins: 0 }
            }
            results.playerResults[player.name].wins += player.wins;
            results.playerResults[player.name].flip7wins += player.flip7wins;

            results.flip7Results.flip7wins += player.flip7wins;
        })
    }

    // Do some math:
    Object.entries(results.bustResults.bustByHandSize).forEach(([key, value]) => {
        const numKey = Number(key);
        const percentage = ((value.busts / value.drawn) * 100).toFixed(2);

        results.bustResults.bustByHandSize[numKey].percentage = percentage;
    });

    results.flip7Results.percentageChanceOverall = ((results.flip7Results.flip7wins / results.totalRounds) * 100).toFixed(2) + `%`;
    results.flip7Results.percentageChancePerPlayer = ((results.flip7Results.flip7wins / (results.totalRounds * numberOfPlayers)) * 100).toFixed(2) + `%`;

    console.table(results.playerResults);
    console.table(results.bustResults.bustByHandSize);
    console.table(results.bustResults.bustByCardNumber);
    console.table(results.flip7Results);

    const end = performance.now();

    console.log(`Time to Perform Simulation: ${end - start} milliseconds for ${numberOfGames} games.`)
}

// TODO: Possibly build a return type for game()
// Flip7 Game
export function runGame({ deck, numberOfPlayers, winAt } : GameConfig) {
    // Step 1:  Create Players, Deck, Discard Pile, Results Objects, and Round Counter.
    let players = createPlayers(numberOfPlayers);
    let shuffledDeck: string[] = shuffle(deck);
    let discardPile: string[] = [];
    let bustResults = createBustObject();
    let roundsCounter: number = 0;

    // Step 2:  Play Game Until a Player has a Score at/above winAt
    while (players.every((player) => player.score < winAt)) {
        // Step 2a: Increment Rounds Counter
        roundsCounter++;

        // Step 2b: Play Round until all players have completed their turns
        while (players.some((player) => player.turnComplete === false)) {


            // Step 2c:  Each Player Draws a Card -- This is where most logic for the game exists
            players.forEach((player) => {
                if (player.turnComplete) { return }; // If player turnComplete (busted or staying), move to next player

                // Reshuffle Deck From Discard Pile if Deck is Empty.  Then clear Discard Pile.
                if (shuffledDeck.length === 0) { shuffledDeck = shuffle([...discardPile]); discardPile.length = 0 };

                const decisionInput: DecisionInput = {
                    hand: player.cards,
                }

                const playerDecision: Decision = player.strategy(decisionInput);
                
                // Honestly, do I even need a switch here, or would if if else work?  
                switch (playerDecision) {
                    case 'stay': 
                        player.turnComplete = true;
                        player.score += sumArray(player.cards);
                        return;
                        break;
                    case 'hit':
                        // Step 2: Draw the next card
                        const nextCard: string = shuffledDeck.shift()!;

                        bustResults.bustByHandSize[player.cards.length + 1].drawn++;

                        // Step 3: Determine if player has busted due to drawn card.
                        if (player.cards.includes(nextCard)) {
                            player.busted = true;
                            player.turnComplete = true;
                            player.cards = [...player.cards, nextCard];

                            bustResults.bustByHandSize[player.cards.length].busts++;
                            bustResults.bustByCardNumber[Number(nextCard)]++;

                            return; // Next Player
                        } else {
                            // Flip7 has special rules regarding number of cards
                            // If the user flips 7 cards without busting, they get a bonus and the round ends.
                            // So, we don't need to go over 7 cards.
                            player.cards.push(nextCard);

                            if (player.cards.length === 7) {
                                player.flip7wins++;
                                player.turnComplete = true;
                                player.score += sumArray(player.cards);
                                player.score += 15; // 15 Bonus Points for Getting a Flip7

                                // Probably need to loop through players array and make all player turns complete, or exit out of while loop
                                for (let j = 0; j < players.length; j++) {
                                    players[j].turnComplete = true;
                                }
                                
                            }
                        };
                        break; 
                }
            })
        };

        // End of Round Tasks:
        players.forEach((player) => {
            discardPile = [...discardPile, ...player.cards]
            player.cards.length = 0;
            player.busted = false;
            player.turnComplete = false;
        })

        // "Dealer" shifts
        const firstPlayer = players.shift();
        if (firstPlayer) { players.push(firstPlayer) };
    }

    // Winner Selection:
    let winnerIndex: number = 0;

    for (let k = 0; k < players.length; k++) {
        if (players[k].score >= winAt) {
            if (players[k].score > players[winnerIndex].score) {
                winnerIndex = k;
            } else if (players[k].score === players[winnerIndex].score) {
                // Figure out what to do if player tie
            }
        }
    }

    // Update winner with an additional win
    players[winnerIndex].wins++

    return {
        bustResults,
        players,
        roundsCounter
    }
}

// TODO:  Move this into React side.
function createPlayers(numberOfPlayers: number) : Player[] {
    const players: Player[] = [];
    for (let i = 0; i < numberOfPlayers; i++) {
        players.push({
            busted: false,
            cards: [],
            flip7wins: 0,
            name: `Player ${i + 1}`,
            score: 0,
            strategy: alwaysHit(),
            turnComplete: false,
            wins: 0
        })
    };
    return players;
}

function createBustObject(): BustResults {
    const bustResults: BustResults = {
        bustByCardNumber: {
            0: 0, // Technically Impossible to Bust
            1: 0, // Technically Impossible to Bust
            2: 0, 
            3: 0, 
            4: 0, 
            5: 0, 
            6: 0, 
            7: 0, 
            8: 0, 
            9: 0, 
            10: 0, 
            11: 0, 
            12: 0, 
        },
        bustByHandSize: {
            1: { drawn: 0, busts: 0 },
            2: { drawn: 0, busts: 0 },
            3: { drawn: 0, busts: 0 },
            4: { drawn: 0, busts: 0 },
            5: { drawn: 0, busts: 0 },
            6: { drawn: 0, busts: 0 },
            7: { drawn: 0, busts: 0 },
        }
    }

    return bustResults;
}

function createResultObject() : Results {
    return {
        bustResults: {
            bustByCardNumber: {},
            bustByHandSize: {}
        },
        flip7Results: { 
            flip7wins: 0, 
            percentageChanceOverall: '', 
            percentageChancePerPlayer: '' 
        },
        numberOfGamesRan: 0,
        playerResults: {},
        totalRounds: 0
    }
}

// Need to figure out where to put these rules, and a way to "link" to them at the appropriate place in the code.
    // Rule 1: Use shuffledDeck until it runs out, then shuffle discardPile and make that into the new shuffledDeck
    // Note: Does not include cards already in players hands.