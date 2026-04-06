import { useId } from 'react';
import styles from './RadioInput.module.css';

interface RadioInputOption {
    label: string;
    value: string;
}

interface RadioInputProps {
    className?: string;
    disabled?: boolean;
    error?: string;
    legend?: string;
    name: string; // Radio Group Name
    onBlur?: () => void;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onFocus?: () => void;
    options: RadioInputOption[];
    required?: boolean;
    value: string; // Currently selected value
}

export const RadioInput = ({
    className,
    disabled = false,
    error,
    legend,
    name,
    onBlur,
    onChange,
    onFocus,
    options,
    required = false,
    value,
}: RadioInputProps ) => {
    const groupId = useId();

    return (
        <fieldset className={`${styles.radioInputContainer} ${className ? className : ''}`}>
            {legend && (
                <legend className={styles.legend}>
                    {legend}
                    {required && <span className={styles.required}>*</span>}
                </legend>
            )}

            <div className={styles.optionsContainer}>
                {options.map((option, index) => {
                    const optionId = `${groupId}-option-${index}`;

                    return (
                        <label 
                            key={option.value}
                            htmlFor={optionId} 
                            className={styles.label}
                        >
                            <input
                                aria-invalid={!!error}
                                aria-required={required}
                                checked={option.value === value}
                                className={`${styles.radioInput} ${error ? styles.error : ''}`}
                                disabled={disabled}
                                id={optionId}
                                name={name}
                                onBlur={onBlur}
                                onChange={onChange}
                                onFocus={onFocus}
                                required={required}
                                type="radio"
                                value={option.value}
                            />

                            <span className={styles.labelText}>{option.label}</span>
                        </label>
                    )
                })}
                
            </div>

            {error && <span className={styles.errorMessage} role='alert'>{error}</span>}
        </fieldset>
    )
}

RadioInput.displayName = 'RadioInput';