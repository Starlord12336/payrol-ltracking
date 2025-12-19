import React from 'react';
import styles from './Select.module.css';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    placeholder?: string;
    options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, fullWidth = false, className = '', options, ...props }, ref) => {
        const selectClasses = [
            styles.select,
            error && styles['select--error'],
            fullWidth && styles['select--full-width'],
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div className={`${styles.selectWrapper} ${fullWidth ? styles['select-wrapper--full-width'] : ''}`}>
                {label && (
                    <label htmlFor={props.id} className={styles.label}>
                        {label}
                        {props.required && <span className={styles.required}>*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className={selectClasses}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
                    {...props}
                >
                    {props.placeholder && <option value="" disabled selected>{props.placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <span id={`${props.id}-error`} className={styles.error} role="alert">
                        {error}
                    </span>
                )}
                {helperText && !error && (
                    <span id={`${props.id}-helper`} className={styles.helper}>
                        {helperText}
                    </span>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
