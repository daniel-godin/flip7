import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { runSimulation } from './engine/game';
import type { Player } from './types/types';
import { SelectInput } from './components/ui/SelectInput/SelectInput';
import { TextInput } from './components/ui/TextInput/TextInput';
import { alwaysHit, stayAtCardCount, stayAtHandTotal, type StrategyFn } from './engine/strategies';
import { RadioInput } from './components/ui/RadioInput/RadioInput';
import { NumberInput } from './components/ui/NumberInput/NumberInput';
import { NUMBERS_ONLY_DECK } from './constants/deck';
import { alwaysHitSimulation } from './engine/alwaysHitSimulation';

interface PlayerFormInput {
    id: string;
    name: string;
    strategy: {
        type: 'alwaysHit' | 'stayAtCardCount' | 'stayAtHandTotal';
        threshold: string;
    }
}

interface FormData {
    numberOfGames: string; // Convert to number later.
    players: PlayerFormInput[];
    strategyMode: 'uniform' | 'individual'; // All players use the same strategy or each uses their own.
    uniformStrategy: {
        type: 'alwaysHit' | 'stayAtCardCount' | 'stayAtHandTotal';
        threshold: string; // string for working with form input elements. Convert to number onSubmit
    },
    winAt: string; // Convert to number later.
}

export function App() {

    const [formData, setFormData] = useState<FormData>(() => {
        // TODO:  Later, set up a localStorage thing.  Like in seahawk.

        // Default FormData State
        return {
            numberOfGames: "1000",
            players: [
                {
                    id: crypto.randomUUID(),
                    name: '',
                    strategy: {
                        type: 'alwaysHit',
                        threshold: ''
                    },
                },
            ],
            strategyMode: 'uniform',
            uniformStrategy: {
                type: 'alwaysHit',
                threshold: '' 
            },
            winAt: '200'
        }
    });
    const [isRunning, setIsRunning] = useState<boolean>(false);

    useEffect(() => {
        console.log('Form Data:', formData);
    }, [formData])

    // Generic formData input handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

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
                        id: crypto.randomUUID(),
                        name: '',
                        strategy: {
                            type: 'alwaysHit',
                            threshold: ''
                        }
                    } as PlayerFormInput);
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

    const handleStrategyModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value !== "uniform" && value !== "individual") { return }; // Silent Guard

        setFormData(prev => ({
            ...prev,
            strategyMode: value
        }))
    }

    const handleUniformStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;

        if (value !== 'alwaysHit' && value !== "stayAtCardCount" && value !== "stayAtHandTotal") {
            return; // Silent Verification/Guard
        }

        setFormData(prev => ({
            ...prev,
            uniformStrategy: {
                ...prev.uniformStrategy,
                type: value
            }
        }))
    }

    const handleUniformStrategyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setFormData(prev => ({
            ...prev,
            uniformStrategy: {
                ...prev.uniformStrategy,
                threshold: value
            }
        }))
    }

    const handlePlayerStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;

        setFormData(prev => ({
            ...prev,
            players: prev.players.map(player => 
                player.id === id ? { ...player, type: value } : player
            )
        }))
    }


    const handleRunSimulation = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsRunning(true);

        let players: Player[]

        if (formData.strategyMode === 'uniform') {
            // Convert all formData.players to the strategy + threshold
            const tempPlayers: PlayerFormInput[] = formData.players.map((player: PlayerFormInput) => {
                return {
                    id: player.id,
                    name: player.name,
                    strategy: {
                        type: formData.uniformStrategy.type,
                        threshold: formData.uniformStrategy.threshold
                    }
                }
            })

            players = convertPlayers(tempPlayers);
        } else if (formData.strategyMode === 'individual') {
            players = convertPlayers(formData.players);
        } else {
            throw new Error('Strategy mode error.')
        }

        // Convert FormDataPlayers into Simulation/Game Players
        // const players = convertPlayers(formData.players);

        runSimulation({
            deck: NUMBERS_ONLY_DECK,
            players: players,
            numberOfGames: Number(formData.numberOfGames),
            numberOfPlayers: formData.players.length,
            winAt: Number(formData.winAt)
        });

        setIsRunning(false);
    }

    return (
        <div className={styles.app}>
            <h1>Flip 7 Game / Simulation</h1>

            <form className={styles.gameOptionsForm} onSubmit={handleRunSimulation}>
                {/* 1. Choose Number of Games For Simulation */}
                <NumberInput
                    label='Number of Games'
                    name='numberOfGames'
                    onChange={handleInputChange}
                    value={formData.numberOfGames}
                />

                {/* 2. Select Number of Players */}
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

                {/* 3. Select Winning Condition: Default 200 */}
                <NumberInput
                    label='Win At (default: 200)'
                    name='winAt'
                    onChange={handleInputChange}
                    value={formData.winAt}
                />

                {/* 4. Choose Uniform Strategy or Individual Strategy (each player gets their own strategy) */}
                <RadioInput
                    disabled={isRunning}
                    legend='Strategy Mode'
                    name='strategyMode'
                    options={[
                        { label: 'Same Strategy For All Players (Uniform)', value: 'uniform' },
                        { label: 'Configure Each Player Individually (Individual)', value: 'individual' }
                    ]}
                    onChange={handleStrategyModeChange}
                    value={formData.strategyMode}
                />

                {formData.strategyMode === 'uniform' && (
                    <>
                        <SelectInput
                            disabled={isRunning}
                            // label='Player Strategy'
                            // id={player.id}
                            name='playerStrategy'
                            onChange={handleUniformStrategyChange}
                            required={false}
                            value={formData.uniformStrategy?.type}
                            options={[
                                { label: 'Always Hit', value: 'alwaysHit' },
                                { label: 'Stay At Card Count', value: 'stayAtCardCount' },
                                { label: 'Stay At Hand Total', value: 'stayAtHandTotal' },
                            ]}  
                        />

                        {(formData.uniformStrategy.type === "stayAtCardCount" || formData.uniformStrategy.type === 'stayAtHandTotal') && (
                            <NumberInput
                                name='uniformNumber'
                                onChange={handleUniformStrategyNumberChange}
                                value={String(formData.uniformStrategy.threshold)}

                            />
                        )}
                    </>
                )}

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
                                    disabled={isRunning || formData.strategyMode === 'uniform'}
                                    // label='Player Strategy'
                                    id={player.id}
                                    name='playerStrategy'
                                    onChange={handlePlayerStrategyChange}
                                    required={false}
                                    value={player.strategy.type}
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

function convertPlayers(playersInput: PlayerFormInput[]) : Player[] {

    // forEach or map()?  And why???
    const players: Player[] = playersInput.map((player: PlayerFormInput) => {
        let strategy: StrategyFn;
        switch (player.strategy.type) {
            case 'alwaysHit': 
                strategy = alwaysHit();
                break;
            case 'stayAtCardCount':
                strategy = stayAtCardCount(Number(player.strategy.threshold));
                break;
            case 'stayAtHandTotal':
                strategy = stayAtHandTotal(Number(player.strategy.threshold));
                break;
        }

        return {
            busted: false,
            cards: [],
            flip7wins: 0,
            id: player.id,
            name: player.name,
            score: 0,
            // strategy: StrategyFn | null; // This needs to be something else..
            // strategy: {
            //     type: 'alwaysHit' | 'stayAtCardCount' | 'stayAtHandTotal' // Need to make this it's own type I guess
            //     threshold?: number;
            //     strategyFn?: StrategyFn;
            // }
            strategy: strategy,
            turnComplete: false,
            wins: 0
        }
    })

    return players
}