import { forwardRef, useId } from 'react';
import styles from './SelectInput.module.css'

interface SelectOption {
    disabled?: boolean; // For those instances where you still want to show the option, but not allow it to be used
    label: string;
    value: string; // possibly number as well???
}

interface SelectInputProps {
    className?: string;
    disabled?: boolean;
    error?: string;
    id?: string;
    label?: string;
    name: string;
    onBlur?: () => void;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    onFocus?: () => void;
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
    value: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(({
    className,
    disabled = false,
    error,
    id, 
    label,
    name,
    onBlur,
    onChange,
    onFocus,
    options,
    placeholder = "-- Select an Option --", 
    required = false,
    value,
}, ref) => {

    const inputId = id || useId();

    return (
        <div className={`${styles.selectInputContainer} ${className ? className : ''}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={styles.inputContainer}>
                <select
                    aria-invalid={!!error}
                    aria-required={required}
                    className={`${styles.selectInput} ${error ? styles.error : ''}`}
                    disabled={disabled}
                    id={inputId}
                    name={name}
                    onBlur={onBlur}
                    onChange={onChange}
                    onFocus={onFocus}
                    ref={ref}
                    required={required}
                    value={value}
                >
                    {required && placeholder && (
                        <option value='' disabled className={styles.option}>{placeholder}</option>
                    )}

                    {options.map((option) => (
                        <option
                            className={styles.option}
                            disabled={option.disabled}
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>

                    ))}
                
                </select>

            </div>
            
            {error && <span className={styles.errorMessage} role='alert'>{error}</span>}
        </div> 
    )
})

SelectInput.displayName = 'SelectInput';