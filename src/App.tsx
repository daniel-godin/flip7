import styles from './App.module.css';

export function App() {

    const runGame = () => {
        console.log('game started');
    }

    return (
        <div className={styles.app}>
            <h1>Flip 7 Game / Simulation</h1>

            <button type='button' onClick={runGame}>Run Game</button>

        </div>
    )
}