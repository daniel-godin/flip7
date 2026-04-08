import type { Results } from '../../../types/types';
import styles from './SimulationResults.module.css';

interface SimulationResultsProps {
    results: Results;
}

export function SimulationResults({ results } : SimulationResultsProps) {

    return (
        <div className={styles.simulationResults}>
            <h2>Simulation Results</h2>

        </div>
    )
}