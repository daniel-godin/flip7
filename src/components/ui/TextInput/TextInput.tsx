import { forwardRef, useId } from 'react';
import styles from './TextInput.module.css'

interface TextInputProps {
    autoComplete?: string;
    className?: string;
    disabled?: boolean;
    error?: string;
    icon?: React.ReactNode;
    id?: string;
    label?: string;
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

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
    autoComplete,
    className,
    disabled = false,
    error,
    icon,
    id, 
    label, 
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

    return (
        <div className={`${styles.textInputContainer} ${className ? className : ''}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={styles.inputContainer}>
                {/* Conditionally loaded Icon */}
                {icon && icon}
                <input
                    aria-invalid={!!error}
                    aria-required={required}
                    autoComplete={autoComplete}
                    className={`${styles.textInput} ${error ? styles.error : ''}`}
                    disabled={disabled}
                    id={inputId}
                    maxLength={maxLength}
                    name={name}
                    onBlur={onBlur}
                    onChange={onChange}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    ref={ref}
                    required={required}
                    type="text"
                    value={value}
                />
                {required && !label && (
                    <span className={styles.required}>*</span>
                )}
            </div>
            
            {error && <span className={styles.errorMessage} role='alert'>{error}</span>}
        </div>
    )
})

TextInput.displayName = 'TextInput';