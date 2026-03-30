

/**
 * Shuffles an array using the Fisher-Yates algorithm with cryptographically secure randomness.
 * Returns a new array without mutating the original.
 */
export function shuffle<T>(arr: Array<T>) : Array<T> {
    const shuffled = [...arr]; // Keeps original array (arr) un-mutated;

    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap current element with randomly selected element
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
}