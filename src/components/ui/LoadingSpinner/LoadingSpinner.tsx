import type { CSSProperties } from 'react';
import styles from './LoadingSpinner.module.css'

interface LoadingSpinnerProps {
    size?: number;
    color?: string;
    className?: string;
    style?: CSSProperties;
}

export function LoadingSpinner({
    size = 40,
    color = '#1a73e8',
    className = '',
    style = {}
} : LoadingSpinnerProps) {
    return (
        <div 
            className={`${styles.spinnerContainer} ${className}`}
            style={style}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.spinner}
            >
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke={color}
                    strokeWidth="5"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    )
}