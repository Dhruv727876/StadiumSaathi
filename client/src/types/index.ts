/**
 * Represents a user session within the StadiumSaathi application.
 */
export interface UserSession {
  /** The unique identifier of the user */
  uid: string;
  /** The email of the user */
  email: string | null;
  /** The user's preferred display name */
  displayName: string | null;
}

/**
 * Represents an operational alert in the stadium.
 */
export interface StadiumAlert {
  /** The unique identifier of the alert */
  id: string;
  /** The title of the alert */
  title: string;
  /** The severity status level */
  severity: 'low' | 'medium' | 'high';
  /** Timestamp indicating when the alert was created */
  timestamp: string;
}

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
