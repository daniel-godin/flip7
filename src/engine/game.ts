
import { NUMBERS_ONLY_DECK } from "../constants/deck";
import type { GameConfig, Player } from "../types/types";
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
    numberOfGames: 1000,
}

interface PlayerResult {
    flip7wins: number;
    name: string;
    wins: number;
}

interface Results {
    numberOfGamesRan: number;
    playerResults: Record<string, PlayerResult>
}

export function runSimulation() {

    const results: Results = {
        numberOfGamesRan: 0,
        playerResults: {}
    }


    for (let i = 0; i < simulationConfig.numberOfGames; i++) {
        let gameResult = game({
            deck: simulationConfig.gameConfig.deck,
            hardStayAt: simulationConfig.gameConfig.hardStayAt,
            numberOfPlayers: simulationConfig.gameConfig.numberOfPlayers,
            winAt: simulationConfig.gameConfig.winAt
        });

        results.numberOfGamesRan++;

        // Loop through gameResult.players and update results.playerResults object.
        gameResult.players.forEach((player) => {
            // Update associated player in results.playerResults
            if (!results.playerResults[player.name]) {
                results.playerResults[player.name] = { flip7wins: 0, name: player.name, wins: 0 }
            }
            results.playerResults[player.name].wins += player.wins;
            results.playerResults[player.name].flip7wins += player.flip7wins;
        })
    }

    console.table(results.playerResults);
}

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
    
    const bustedAt: Record<number, number> = {
        // 0: 0,  // Technically Impossible to Bust
        // 1: 0,  // Technically Impossible to Bust
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
    };

    const bustedCard: Record<number, number> = {
        // 0: 0, // Technically Impossible to Bust
        // 1: 0, // Technically Impossible to Bust
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
    }

    // Game: Winning Condition:  Any player has gameConfig.winAt score or above at the end of a round.
    while (players.every((player) => player.score < winAt)) {

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

                // Step 3: Determine if player has busted due to drawn card.
                if (player.cards.includes(nextCard)) {
                    player.busted = true;
                    player.turnComplete = true;
                    player.cards = [...player.cards, nextCard];

                    bustedAt[player.cards.length]++;
                    bustedCard[Number(nextCard)]++;

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
        players
    }

    console.table(players);
    console.table(bustedAt);
    console.table(bustedCard);
}

function sumArray(arr: string[]): number {
    const numArr: number[] = [];

    arr.forEach((element) => {
        if (isNaN(Number(element))) { return }; // If NaN after Number(), it is "+2", "+10", "FREEZE", etc.
        numArr.push(Number(element));
    })

    return numArr.reduce((sum, card) => sum + Number(card), 0);
}