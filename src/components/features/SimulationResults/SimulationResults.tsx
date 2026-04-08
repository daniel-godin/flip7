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


        </div>


    )
}