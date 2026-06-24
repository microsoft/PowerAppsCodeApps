// Reusable validation utilities
// Add more validators here as needed.

/**
 * Basic email format validation.
 * Accepts most standard email formats while remaining lightweight.
 * Returns true for empty strings so optional email fields can skip validation upstream.
 */
export function isValidEmail(email: string | undefined | null): boolean {
    if (!email) return true; // treat empty as valid when field optional
    const trimmed = email.trim();
    if (!trimmed) return true;
    // Simple pattern: local-part@domain.tld (at least one dot in domain part)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
}

/**
 * Returns an error message if invalid, otherwise null.
 */
export function getEmailError(email: string | undefined | null): string | null {
    return isValidEmail(email) ? null : 'Please enter a valid email address.';
}

/**
 * Sanitize phone input as the user types.
 * Removes any characters except digits and the explicitly allowed formatting chars: ( ) - and a single space
 * (space only allowed after a closing parenthesis for 10-digit formatting convenience).
 */
export function sanitizePhoneInput(raw: string | undefined | null): string {
    if (!raw) return '';
    // Keep digits and these symbols. Remove everything else.
    return raw.replace(/[^0-9()\-\s]/g, '');
}

/**
 * Format a string containing a 7- or 10-digit US-style phone number.
 * 7 digits => XXX-XXXX
 * 10 digits => (XXX) XXX-XXXX
 * If the digit count is not 7 or 10 the original (sanitized) string is returned.
 */
export function formatPhone(raw: string | undefined | null): string {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 7) {
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return raw.trim();
}

/**
 * Check if a phone number string is valid (7 or 10 digits) and properly formatted OR format-able.
 * Accepts already formatted values: (XXX) XXX-XXXX or XXX-XXXX.
 * Attempts to auto-format if possible before flagging invalid.
 * Empty / undefined returns true so optional fields can be left blank.
 */
export function isValidPhone(phone: string | undefined | null): boolean {
    if (!phone) return true; // treat empty as valid for optional fields
    const trimmed = phone.trim();
    if (!trimmed) return true;

    // Direct pattern matches (allow optional single space after parenthesis)
    const tenPattern = /^\(\d{3}\)\s?\d{3}-\d{4}$/; // (123) 456-7890 or (123)456-7890
    const sevenPattern = /^\d{3}-\d{4}$/;              // 123-4567
    if (tenPattern.test(trimmed) || sevenPattern.test(trimmed)) return true;

    // Attempt reformatting based purely on digit count.
    const digits = trimmed.replace(/\D/g, '');
    return digits.length === 7 || digits.length === 10;
}

/**
 * Returns a standardized, formatted phone string if possible, else the original trimmed value.
 * If invalid (cannot be formatted to 7 or 10 digit pattern) returns original and caller can use getPhoneError.
 */
export function coercePhone(phone: string | undefined | null): string {
    if (!phone) return '';
    const trimmed = phone.trim();
    if (!trimmed) return '';
    const formatted = formatPhone(trimmed);
    // If formatted introduces correct pattern, use it; else original trimmed.
    if (isValidPhone(formatted)) return formatted;
    return trimmed;
}

/**
 * Return error message (null if valid) for phone numbers.
 * Will attempt formatting; if formatting possible result is considered valid.
 */
export function getPhoneError(phone: string | undefined | null): string | null {
    if (!phone || !phone.trim()) return null; // optional empty
    if (isValidPhone(phone)) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 7 && digits.length !== 10) {
        return 'Phone must have exactly 7 or 10 digits.';
    }
    return 'Invalid phone number format.';
}

