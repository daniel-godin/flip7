

export interface GameConfig {
    players: number; // Later possibly a Player Type
    deck: string[];
}

export interface Player {
    busted: boolean;
    cards: string[];
    flip7wins: number;
    name: string;
    score: number;
    turnComplete: boolean;
}

export interface Results {

}