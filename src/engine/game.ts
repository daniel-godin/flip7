
import { NUMBERS_ONLY_DECK } from "../constants/deck";
import type { GameConfig, Player, Results } from "../types/types";
import { shuffle } from "../utilities/shuffle";

const NUMBER_OF_ROUNDS = 100_000;

const gameConfig: GameConfig = {
    players: 4,
    deck: NUMBERS_ONLY_DECK
}

const results: Results = {};

export function game() {
    // Rule 1: Use shuffledDeck until it runs out, then shuffle discardPile and make that into the new shuffledDeck
    // Note: Does not include cards already in players hands.
    let shuffledDeck: string[] = shuffle(gameConfig.deck);
    let discardPile: string[] = [];

    const players: Player[] = [];

    for (let i = 0; i < gameConfig.players; i++) {
        players.push({
            busted: false,
            cards: [],
            flip7wins: 0,
            name: `Player ${i + 1}`,
            score: 0,
            turnComplete: false
        })
    }

    console.log('players: ', players);
    

    const bustedAt: Record<number, number> = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
    };

    // Rounds:
    for (let i = 1; i <= NUMBER_OF_ROUNDS; i++) {
        // For each round, we need to cycle through each player until they all "bust".
        // Later iterations will introduce "gaming" mechanisms


        // When all players have busted: true... new round.
        while (players.some((player) => player.turnComplete === false)) {
            // Loop through players:
            players.forEach((player) => {
                if (player.turnComplete) { return }; // If player busted, move to next player

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

                    return; // Next Player
                } else {
                    // Flip7 has special rules regarding number of cards
                    // If the user flips 7 cards without busting, they get a bonus and the round ends.
                    // So, we don't need to go over 7 cards.
                    player.cards.push(nextCard);

                    if (player.cards.length === 7) {
                        player.flip7wins++;
                        player.turnComplete = true;

                        // Probably need to loop through players array and make all player turns complete, or exit out of while loop
                        for (let j = 0; j < players.length; j++) {
                            players[j].turnComplete = true;
                        }
                        
                    }
                }  
            })
        }

        // Clean up after round:
        players.forEach((player) => {
            discardPile = [...discardPile, ...player.cards]
            player.cards.length = 0;
            player.busted = false;
            player.turnComplete = false;
        })





        // Lets start with 1 player and we will increase from there once we get that correct.
        // for (let j = 1; j <= 100; j++) {
        //     // What to do if there are no more cards to be drawn?
        //     if (shuffledDeck.length === 0) {
        //         shuffledDeck = shuffle([...discardPile]);
        //         discardPile.length = 0;
        //     }

        //     const nextCard: string = shuffledDeck.shift()!;

        //     // If card already exists in the player array... it's a BUST!  Otherwise, add to array.
        //     if (player.includes(nextCard)) {
        //         bustedAt[j]++;

        //         // After Busting: Put drawn cards into discardPile
        //         discardPile = [...discardPile, ...player, nextCard];

        //         // Clear player array
        //         player.length = 0;

        //         // Stop drawing cards and do another round
        //         break;

        //     } else {
        //         // Flip7 has special rules regarding number of cards
        //         // If the user flips 7 cards without busting, they get a bonus and the round ends.
        //         // So, we don't need to go over 7 cards.
        //         player.push(nextCard);

        //         if (player.length === 7) {
        //             flip7Wins++;
                    
        //             // Put pulled cards to back of deck array
        //             discardPile = [...discardPile, ...player]

        //             // Clear player array
        //             player.length = 0;

        //             // Stop drawing cards and do another round
        //             break;
        //         }
        //     }  
        // }
    }

    console.table(players);

    const results = Object.fromEntries(
        Object.entries(bustedAt).map(([key, value]) => [key, ((value / NUMBER_OF_ROUNDS) * 100).toFixed(2) + "%"])
    );

    console.log(`Flip7 Wins (${flip7Wins}) which is a ${((flip7Wins / NUMBER_OF_ROUNDS) * 100).toFixed(2) + '%'} success rate.`);
    console.table(results);
}