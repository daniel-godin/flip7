import type { Results } from '../../../types/types';
import { LoadingSpinner } from '../../ui/LoadingSpinner/LoadingSpinner';
import styles from './SimulationResults.module.css';

interface SimulationResultsProps {
    results: Results;
}

export function SimulationResults({ results } : SimulationResultsProps) {

    return (
        <div className={styles.simulationResults}>
            <h2>Simulation Results</h2>
            
            <div className={styles.basicResults}>
                {/* Games Played */}
                <div className={styles.box}>
                    <h3>Games Played:</h3>
                    <p>{results.numberOfGamesRan.toLocaleString()}</p>
                </div>

                {/* Rounds Played */}
                <div className={styles.box}>
                    <h3>Rounds Played:</h3>
                    <p>{results.totalRounds.toLocaleString()}</p>
                </div>


                {/* Simulation Time */}
                <div className={styles.box}>
                    <h3>Simulation Time:</h3>
                    <p>{results.simulationTime.toLocaleString()} (milliseconds)</p>
                </div>
            </div>

            {/* Player Results */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th scope='col'>Player Name</th>
                        <th scope='col'>Strategy</th>
                        <th scope='col'>Wins</th>
                        <th scope='col'>Flip7's</th>
                        <th scope='col'>Win Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(results.playerResults).map((player) => (
                        <tr key={player.name}>
                            <td>{player.name}</td>
                            <td>{player.strategy}</td>
                            <td>{player.wins.toLocaleString()}</td>
                            <td>{player.flip7wins.toLocaleString()}</td>
                            <td>{`${((player.wins / results.numberOfGamesRan) * 100)}%`}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Flip 7 Results */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th scope='col'>Flip 7 Wins (total)</th>
                        <th scope='col'>Percent Chance (overall)</th>

                        {/* Per game or per round??? */}
                        <th scope='col'>Percent Chance (per player)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{results.flip7Results.flip7wins}</td>
                        <td>{results.flip7Results.percentageChanceOverall}</td>
                        <td>{results.flip7Results.percentageChancePerPlayer}</td>
                    </tr>
                </tbody>
            </table>

            {/* Busted Results -- By Hand Size */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th scope='col'>Hand Size</th>
                        <th scope='col'>Drawn</th>
                        <th scope='col'>Busts</th>
                        <th scope='col'>Bust %</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(results.bustResults.bustByHandSize).map(([handSize, data]) => (
                        <tr key={handSize}>
                            <td>{handSize}</td>
                            <td>{data.drawn.toLocaleString()}</td>
                            <td>{data.busts.toLocaleString()}</td>
                            <td>{data.percentage}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Busted Results -- By Card Number */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th scope='col'>Card Number</th>
                        <th scope='col'>Times Caused Bust</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(results.bustResults.bustByCardNumber).map(([cardNumber, count]) => (
                        <tr key={cardNumber}>
                            <td>{cardNumber}</td>
                            <td>{count.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>


        </div>


    )
}