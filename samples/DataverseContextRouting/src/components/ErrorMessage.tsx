/**
 * ErrorMessage Component
 * Displays error messages to the user
 *
 * PATTERN: Conditional Rendering
 * - Returns null when no error (React optimization)
 * - Shows styled error banner when error exists
 * - Displays user-friendly error messages from state
 */

/**
 * Props for the ErrorMessage component
 */
interface ErrorMessageProps {
  error: string | null;  // Error message to display (null if no error)
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  // Early return pattern: Don't render anything if no error
  if (!error) return null;

  return (
    <div className="error-message">
      <strong>Error:</strong> {error}
    </div>
  );
}
