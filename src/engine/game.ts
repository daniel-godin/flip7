
import { NUMBERS_ONLY_DECK } from "../constants/deck";
import type { GameConfig, Player } from "../types/types";
import { shuffle } from "../utilities/shuffle";

const NUMBER_OF_ROUNDS = 100_000;

const gameConfig: GameConfig = {
    players: 5,
    deck: NUMBERS_ONLY_DECK
}

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

    // Rounds:
    for (let i = 1; i <= NUMBER_OF_ROUNDS; i++) {
        // For each round, we need to cycle through each player until they all "bust".
        // Later iterations will introduce "gaming" mechanisms


        // When all players have busted: true... new round.
        while (players.some((player) => player.turnComplete === false)) {
            // Loop through players:
            players.forEach((player) => {
                if (player.turnComplete) { return }; // If player busted, move to next player

                if (player.cards.length === 3) {
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

        // "Dealer" shifts
        const firstPlayer = players.shift();
        if (firstPlayer) { players.push(firstPlayer) };
    }

    console.table(players);
    console.table(bustedAt);
    console.table(bustedCard);
}

export function alwaysHitSimulation() {
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

        // "Dealer" shifts
        const firstPlayer = players.shift();
        if (firstPlayer) { players.push(firstPlayer) };
    }

    console.table(players);
    console.table(bustedAt);
    console.table(bustedCard);
}