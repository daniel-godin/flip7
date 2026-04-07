import { forwardRef, useId } from 'react';
import styles from './NumberInput.module.css';

interface NumberInputProps {
    autoComplete?: string;
    className?: string;
    disabled?: boolean;
    error?: string;
    id?: string;
    label?: string;
    max?: number;
    maxLength?: number;
    name: string;
    onBlur?: () => void;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onFocus?: () => void;
    placeholder?: string;
    readOnly?: boolean;
    required?: boolean;
    value: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(({
    autoComplete,
    className,
    disabled = false,
    error,
    id, 
    label, 
    max = 1_000_000_000, // Default max is 1 billion
    maxLength,
    name,
    onBlur,
    onChange,
    onFocus,
    placeholder, 
    readOnly = false,
    required = false,
    value,
}, ref) => {

    const inputId = id || useId();

    // Handle validation before passing to parent
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        // Allow whole numbers only
        const regex = /^\d*$/;

        // Validation 1 -- Check that input passes regex test (digit 0+)
        if (!regex.test(input)) {
            console.log('invalid 1')
            return;
        }

        // Validation 2 -- Check to make sure input is not greater than 999
        if (input !== '') {
            const num = parseInt(input, 10);
            if (num > max) {
                return;
            }
        }

        // Valid -- Pass to parent
        onChange(e);
    }

    return (
        <div className={`${styles.numberInputContainer} ${className ? className : ''}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={styles.inputContainer}>
                {/* Icon */}
                <input
                    aria-invalid={!!error}
                    aria-required={required}
                    autoComplete={autoComplete}
                    className={`${styles.numberInput} ${error ? styles.error : ''}`}
                    disabled={disabled}
                    id={inputId}
                    inputMode='numeric'
                    maxLength={maxLength}
                    name={name}
                    onBlur={onBlur}
                    onChange={handleChange}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    ref={ref}
                    required={required}
                    type="text"
                    value={value}
                />
            </div>
            
            {error && <span className={styles.errorMessage} role='alert'>{error}</span>}
        </div>
    )
})

NumberInput.displayName = 'NumberInput';