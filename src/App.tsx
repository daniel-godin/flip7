import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { runSimulation, type PlayerSetup } from './engine/game';
import { type Results } from './types/types';
import { SelectInput } from './components/ui/SelectInput/SelectInput';
import { TextInput } from './components/ui/TextInput/TextInput';
import { alwaysHit, stayAtCardCount, stayAtHandTotal, type StrategyFn } from './engine/strategies';
import { RadioInput } from './components/ui/RadioInput/RadioInput';
import { NumberInput } from './components/ui/NumberInput/NumberInput';
import { NUMBERS_ONLY_DECK } from './constants/deck';
import { SimulationResults } from './components/features/SimulationResults/SimulationResults';

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
                    name: 'Player 1',
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
    const [results, setResults] = useState<Results | null>(null);

    // TODO: Delete this later. For testing only
    useEffect(() => {
        console.log('results:', results);
    }, [results])

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
                        name: `Player ${i + 1}`,
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

        if (value !== 'alwaysHit' && value !== 'stayAtCardCount' && value !== 'stayAtHandTotal') { return }; // Silent Guard

        setFormData(prev => ({
            ...prev,
            players: prev.players.map(player => 
                player.id === id 
                ?   { 
                        ...player,
                        strategy: {
                            ...player.strategy,
                            type: value
                        }
                    } 
                : player
            )
        }))
    }

    const handlePlayerStrategyThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        setFormData(prev => ({
            ...prev,
            players: prev.players.map(player => 
                player.id === id 
                    ?   { 
                            ...player,
                            strategy: {
                                ...player.strategy,
                                threshold: value
                            }
                        } 
                    : player
            )
        }))
    }


    const handleRunSimulation = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsRunning(true);
        try {
            // Convert Players to work with game/engine
                let players: PlayerSetup[]
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

                const simulationResults = runSimulation({
                    deck: NUMBERS_ONLY_DECK,
                    playersSetup: players,
                    numberOfGames: Number(formData.numberOfGames),
                    winAt: Number(formData.winAt)
                });

                setResults(simulationResults);
        } catch (error) {
            console.error('Error in handleRunSimulation', error);
        } finally {
            setIsRunning(false);
        }
    }

    return (
        <div className={styles.app}>
            <div className={styles.configPanel}>
                <h1>Flip 7 Game / Simulation</h1>

                <form className={styles.gameOptionsForm} onSubmit={handleRunSimulation} autoComplete='off'>
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
                                    label='Stay At:'
                                    name='uniformNumber'
                                    onChange={handleUniformStrategyNumberChange}
                                    value={formData.uniformStrategy.threshold}

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
                                        value={player.name}
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

                                    {/* Render a Number Input for strategies that have a stayAt */}
                                    {(player.strategy.type === 'stayAtCardCount' || player.strategy.type === 'stayAtHandTotal') && (
                                        <NumberInput
                                            // label='Stay At:'
                                            id={player.id}
                                            name='stayAt'
                                            onChange={handlePlayerStrategyThresholdChange}
                                            value={player.strategy.threshold}

                                        />
                                    )}
                                </div>
                            )
                        })}
                    </fieldset>

                    <button type='submit' disabled={isRunning}>Run Game</button>
                </form>


            </div>

            <div className={styles.results}>
                {!results && (<h2>Run Simulation To Get Results</h2>)}
                {results && (<SimulationResults results={results} />) }
            </div>

        </div>
    )
}

function convertPlayers(playersInput: PlayerFormInput[]) : PlayerSetup[] {

    const players: PlayerSetup[] = playersInput.map((player: PlayerFormInput) => {
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
            id: player.id,
            name: player.name,
            strategy: strategy,
        }
    })

    return players
}