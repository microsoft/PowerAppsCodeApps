/**
 * Footer Component
 * Displays informational footer about the app
 *
 * PATTERN: Static Informational Component
 * - No props or state
 * - Provides context about the app's architecture
 * - Educates developers about the service layer pattern
 */

export function Footer() {
  return (
    <footer>
      <p>
        This app demonstrates CRUD operations and lookup field handling using generated service files from PAC CLI.
        All operations use the <code>ContactsService</code> and <code>AccountsService</code> generated files.
        Services handle all Dataverse communication, keeping components pure and testable.
      </p>
    </footer>
  );
}
