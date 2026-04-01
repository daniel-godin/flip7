
import { NUMBERS_ONLY_DECK } from "../constants/deck";
import type { BustResults, GameConfig, Player, Results } from "../types/types";
import { shuffle } from "../utilities/shuffle";

interface SimulationConfig {
    gameConfig: GameConfig;
    numberOfGames: number;
}

const simulationConfig: SimulationConfig = {
    gameConfig: {
        deck: NUMBERS_ONLY_DECK,
        // hardStayAt: 4,  // For simulations that want a hard stay for every player
        numberOfPlayers: 5, // Flip7 says up to 18 players *per deck*, so add a deck if there are more than 18 players.
        winAt: 200 // Default for Flip7 is 200
    },
    numberOfGames: 10_000,
}

export function runSimulation() {
    const start = performance.now();

    const results: Results = {
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


    for (let i = 0; i < simulationConfig.numberOfGames; i++) {
        let gameResult = game({
            deck: simulationConfig.gameConfig.deck,
            hardStayAt: simulationConfig.gameConfig.hardStayAt,
            numberOfPlayers: simulationConfig.gameConfig.numberOfPlayers,
            winAt: simulationConfig.gameConfig.winAt
        });

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
    results.flip7Results.percentageChancePerPlayer = ((results.flip7Results.flip7wins / (results.totalRounds * simulationConfig.gameConfig.numberOfPlayers)) * 100).toFixed(2) + `%`;

    console.log(`Number of games: `, simulationConfig.numberOfGames);
    console.table(results.playerResults);
    console.table(results.bustResults.bustByHandSize);
    console.table(results.bustResults.bustByCardNumber);
    console.table(results.flip7Results);

    const end = performance.now();

    console.log(`Time to Perform Simulation: ${end - start} milliseconds`)
}

// Maybe set up a return type for this...
export function game({ deck, hardStayAt, numberOfPlayers, winAt } : GameConfig) {
    // Rule 1: Use shuffledDeck until it runs out, then shuffle discardPile and make that into the new shuffledDeck
    // Note: Does not include cards already in players hands.
    let shuffledDeck: string[] = shuffle(deck);
    let discardPile: string[] = [];

    const players: Player[] = [];
    for (let i = 0; i < numberOfPlayers; i++) {
        players.push({
            busted: false,
            cards: [],
            flip7wins: 0,
            name: `Player ${i + 1}`,
            score: 0,
            turnComplete: false,
            wins: 0
        })
    }

    const bustResults = createBustObject();

    let roundsCounter: number = 0;

    // Game: Winning Condition:  Any player has gameConfig.winAt score or above at the end of a round.
    while (players.every((player) => player.score < winAt)) {

        roundsCounter++;

        // Rounds:
        while (players.some((player) => player.turnComplete === false)) {


            // Loop through players:
            players.forEach((player) => {
                if (player.turnComplete) { return }; // If player turnComplete (busted or staying), move to next player

                // For simulations that want a hard stay for every player
                if (hardStayAt && player.cards.length === hardStayAt) {
                    player.turnComplete = true;
                    player.score += Number(player.cards.reduce((sum, card) => sum + Number(card), 0));
                    return;
                }


                // Step 1: if shuffledDeck is empty, make a new shuffledDeck from the discardPile
                if (shuffledDeck.length === 0) {
                    shuffledDeck = shuffle([...discardPile]);
                    discardPile.length = 0;
                }

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

function strategy (): 'hit' | 'stay' {
    let decision: 'hit' | 'stay';

    return 'hit';
    // What to pass into strategy?
    // 1. Player Hand
    // 2. All "Visible" Hands of other players
    // 3. Player location the round, related to dealer
    // 4. 



    // Needs to return "hit" or "stay".
    return decision;
}

function sumArray(arr: string[]): number {
    const numArr: number[] = [];

    arr.forEach((element) => {
        if (isNaN(Number(element))) { return }; // If NaN after Number(), it is "+2", "+10", "FREEZE", etc.
        numArr.push(Number(element));
    })

    return numArr.reduce((sum, card) => sum + Number(card), 0);
}