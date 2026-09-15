import React from 'react';
import { Field, Input } from '@fluentui/react-components';
import { sanitizePhoneInput, formatPhone, getPhoneError } from '../../utils/validation';

export interface PhoneFieldProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
    value,
    onChange,
    label = 'Phone',
    required,
    disabled,
    placeholder = 'Enter phone number'
}) => {
    const error = getPhoneError(value);
    return (
        <Field
            label={label}
            required={required}
            validationState={error ? 'error' : 'none'}
            validationMessage={error || undefined}
        >
            <Input
                type="tel"
                value={value}
                disabled={disabled}
                aria-invalid={!!error}
                onChange={(_, d) => onChange(sanitizePhoneInput(d.value))}
                onBlur={() => onChange(formatPhone(value))}
                placeholder={placeholder}
            />
        </Field>
    );
};

export default PhoneField;
