/**
 * Header Component
 * Displays the app title and description
 *
 * PATTERN: Simple Stateless Component
 * - Pure function that renders props
 * - No business logic or side effects
 * - Reusable across different pages/apps
 */

/**
 * Props for the Header component
 */
interface HeaderProps {
  title: string;       // Main heading text
  description: string; // Subheading text
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
