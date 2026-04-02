import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { runSimulation } from './engine/game';
import type { Player } from './types/types';
import { SelectInput } from './components/ui/SelectInput/SelectInput';
import { TextInput } from './components/ui/TextInput/TextInput';
import { alwaysHit, stayAtCardCount, stayAtHandTotal } from './engine/strategies';

interface FormData {
    players: Player[];
}

export function App() {

    const [formData, setFormData] = useState<FormData>(() => {
        // Later, set up a localStorage thing.  Like in seahawk.

        // Default FormData State
        return {
            players: [
                {
                    busted: false,
                    cards: [],
                    flip7wins: 0,
                    id: crypto.randomUUID(),
                    name: '',
                    score: 0,
                    strategy: null,
                    turnComplete: false,
                    wins: 0
                }
            ]
        }
    });
    const [isRunning, setIsRunning] = useState<boolean>(false);

    useEffect(() => {
        console.log('Form Data:', formData);
    }, [formData])

    const handleNumberOfPlayersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const targetCount: number = Number(e.target.value);

        // Validation/Guard
        if (isNaN(targetCount) || targetCount < 1 || targetCount > 18) {
            console.warn('Number of players allowed: 1-18');
            return;
        }

        setFormData(prev => {
            const currentPlayers = prev.players;

            // Shrinking Number Of Players -- Keep already written players
            if (targetCount < currentPlayers.length) {
                return {
                    ...prev,
                    players: currentPlayers.slice(0, targetCount)
                }
            };

            // Expanding Number Of Players -- Add new blank player
            if (targetCount > currentPlayers.length) {
                const newPlayers = [];
                for (let i = currentPlayers.length; i < targetCount; i++) {
                    newPlayers.push({        
                        busted: false,
                        cards: [],
                        flip7wins: 0,
                        id: crypto.randomUUID(),
                        name: '',
                        score: 0,
                        strategy: null,
                        turnComplete: false,
                        wins: 0
                    });
                };

                return {
                    ...prev,
                    players: [...currentPlayers, ...newPlayers]
                }
            }

            // No Change Needed:
            return prev;
        })
    }

    const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        setFormData(prev => ({
            ...prev,
            players: prev.players.map(player =>
                player.id === id ? { ...player, name: value } : player
            )
        }))
    };

    const handlePlayerStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;

        switch (value) {
            case 'alwaysHit':
                setFormData(prev => ({
                    ...prev,
                    players: prev.players.map(player =>
                        player.id === id ? { ...player, strategy: alwaysHit() } : player
                    )
                }));
                break;
            case 'stayAtCardCount':
                setFormData(prev => ({
                    ...prev,
                    players: prev.players.map(player =>
                        player.id === id ? { ...player, strategy: stayAtCardCount(4) } : player
                    )
                }));
                break;
            case 'stayAtHandTotal':
                setFormData(prev => ({
                    ...prev,
                    players: prev.players.map(player =>
                        player.id === id ? { ...player, strategy: stayAtHandTotal(44) } : player
                    )
                }));
                break;
        }
    }


    const runGame = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsRunning(true);


        runSimulation();

        setIsRunning(false);
    }

    return (
        <div className={styles.app}>
            <h1>Flip 7 Game / Simulation</h1>

            <form className={styles.gameOptionsForm} onSubmit={runGame}>
                <SelectInput
                    disabled={isRunning}
                    label='Number of Players'
                    name='numberOfPlayers'
                    onChange={handleNumberOfPlayersChange}
                    required={false}
                    value={String(formData.players.length)}
                    options={Array.from({ length: 18 }, (_, i) => ({
                        label: String(i + 1),
                        value: String(i + 1)
                    }))}
                />

                <fieldset className={styles.playersContainer}>
                    <legend className={styles.legend}>Players:</legend>

                    {formData.players.map((player, index) => {

                        return (
                            <div key={player.id} className={styles.playerInputContainer}>
                                <TextInput
                                    disabled={isRunning}
                                    id={player.id}
                                    // label='Player Name'
                                    name={player.id}
                                    onChange={handlePlayerNameChange}
                                    placeholder={`Player ${index + 1}`}
                                    required={index < 1} // This adds a red *, indicating it is required. Clear UI/UX
                                    value={player.name || `Player ${index + 1}`}
                                />

                                <SelectInput
                                    disabled={isRunning}
                                    // label='Player Strategy'
                                    id={player.id}
                                    name='playerStrategy'
                                    onChange={handlePlayerStrategyChange}
                                    required={false}
                                    value={String(player.strategy)} // I don't know what to do here.
                                    options={[
                                        { label: 'Always Hit', value: 'alwaysHit' },
                                        { label: 'Stay At Card Count', value: 'stayAtCardCount' },
                                        { label: 'Stay At Hand Total', value: 'stayAtHandTotal' },
                                    ]}  
                                />
                            </div>
                        )
                    })}
                </fieldset>

                <button type='submit' disabled={isRunning}>Run Game</button>
            </form>

        </div>
    )
}