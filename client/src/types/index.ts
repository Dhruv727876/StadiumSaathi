/**
 * Properties for the ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  /** The children nodes to render and monitor for errors */
  children: React.ReactNode;
}

/**
 * State structure for the ErrorBoundary component.
 */
export interface ErrorBoundaryState {
  /** Whether an unhandled error has occurred in the child tree */
  hasError: boolean;
  /** The error object, if captured */
  error: Error | null;
}
