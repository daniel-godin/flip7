import { useState } from 'react';
import styles from './App.module.css';
import { FULL_DECK, NUMBERS_ONLY_DECK } from './constants/deck';
import { game, runSimulation } from './engine/game';

interface GameOptions {
    players: number;
    deck: string[];
}

export function App() {

    const [gameOptions, setGameOptions] = useState<GameOptions>({
        players: 1,
        deck: FULL_DECK
    })


    const handlePlayersChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setGameOptions(prev => ({
            ...prev,
            players: Number(e.target.value)
        }))
    }

    // const handleDeckChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     setGameOptions(prev => ({
    //         ...prev,
    //         deck: e.target.value
    //     }))
    // }

    const runGame = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();


        if (!gameOptions.players || !gameOptions.deck) { return }; // Silent Guard

        // Run the game
        // const gameResults = game(gameOptions.players, gameOptions.deck);

        runSimulation();


    }

    return (
        <div className={styles.app}>
            <h1>Flip 7 Game / Simulation</h1>

            <form className={styles.gameOptionsForm} onSubmit={runGame}>
                <select
                    name='players'
                    onChange={handlePlayersChange}
                    required={true}
                    value={String(gameOptions.players)}
                >
                    <option value='' disabled>Choose Number of Players</option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                    <option value='6'>6</option>
                    <option value='7'>7</option>
                    <option value='8'>8</option>
                    <option value='9'>9</option>
                    <option value='10'>10</option>
                    <option value='11'>11</option>
                    <option value='12'>12</option>
                    <option value='13'>13</option>
                    <option value='14'>14</option>
                    <option value='15'>15</option>
                    <option value='16'>16</option>
                    <option value='17'>17</option>
                    <option value='18'>18</option>
                </select>

                {/* <select
                    name='deck'
                    onChange={handleDeckChange}
                    required={true}
                    value={gameOptions.deck}
                >
                    <option value='' disabled>Choose Deck</option>
                    <option value={FULL_DECK}>FULL DECK</option>
                    <option value={NUMBERS_ONLY_DECK}>Numbers Only Deck</option>

                </select> */}

                <button type='submit'>Run Game</button>
            </form>

        </div>
    )
}