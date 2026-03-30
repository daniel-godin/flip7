
import { NUMBERS_ONLY_DECK } from "../constants/deck";
import { shuffle } from "../utilities/shuffle";

const NUMBER_OF_ROUNDS = 100_000;

export function game() {
    // const shuffledDeck: string[] = shuffle(deck);

    let shuffledDeck: string[] = shuffle(NUMBERS_ONLY_DECK);
    let discardPile: string[] = [];

    let player: string[] = [];

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

    let flip7Wins: number = 0;

    // Rounds:
    for (let i = 1; i <= NUMBER_OF_ROUNDS; i++) {
        // For each round, we need to cycle through each player until they all "bust".
        // Later iterations will introduce "gaming" mechanisms

        // Lets start with 1 player and we will increase from there once we get that correct.
        for (let j = 1; j <= 100; j++) {
            // What to do if there are no more cards to be drawn?
            if (shuffledDeck.length === 0) {
                shuffledDeck = shuffle([...discardPile]);
                discardPile.length = 0;
            }

            const nextCard: string = shuffledDeck.shift()!;

            // If card already exists in the player array... it's a BUST!  Otherwise, add to array.
            if (player.includes(nextCard)) {
                bustedAt[j]++;

                // After Busting: Put drawn cards into discardPile
                discardPile = [...discardPile, ...player, nextCard];

                // Clear player array
                player.length = 0;

                // Stop drawing cards and do another round
                break;

            } else {
                // Flip7 has special rules regarding number of cards
                // If the user flips 7 cards without busting, they get a bonus and the round ends.
                // So, we don't need to go over 7 cards.
                player.push(nextCard);

                if (player.length === 7) {
                    flip7Wins++;
                    
                    // Put pulled cards to back of deck array
                    discardPile = [...discardPile, ...player]

                    // Clear player array
                    player.length = 0;

                    // Stop drawing cards and do another round
                    break;
                }
            }  
        }
    }

    const results = Object.fromEntries(
        Object.entries(bustedAt).map(([key, value]) => [key, ((value / NUMBER_OF_ROUNDS) * 100).toFixed(2) + "%"])
    );

    console.log(`Flip7 Wins (${flip7Wins}) which is a ${((flip7Wins / NUMBER_OF_ROUNDS) * 100).toFixed(2) + '%'} success rate.`);
    console.table(results);
}