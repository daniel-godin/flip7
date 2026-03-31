

export interface GameConfig {
    deck: string[];
    hardStayAt?: number;  // For simulations that want a hard stay for every player
    numberOfPlayers: number; // Later possibly a Player Type
    winAt: number // Total score that allows a player to win
}

export interface Player {
    busted: boolean;
    cards: string[];
    flip7wins: number;
    name: string;
    score: number;
    turnComplete: boolean;
    wins: number;
}