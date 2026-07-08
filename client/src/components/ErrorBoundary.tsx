import React, { Component } from 'react';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../types';

/**
 * Standard Error Boundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  /**
   * Updates state so the next render will show the fallback UI.
   *
   * @param error - The error that was thrown.
   * @returns Updated state mapping.
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Catches errors in the child component tree and can be used to log them.
   *
   * @param error - The captured error.
   */
  public override componentDidCatch(error: Error): void {
    // In production, send this error to your preferred logging service
    // e.g. Sentry/Bugsnag or custom server.
    // For this scaffold, we just avoid throwing further errors.
    this.setState({ error });
  }

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
          <div className="max-w-md w-full text-center space-y-4 bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
            <p className="text-slate-400">
              StadiumSaathi encountered an unexpected rendering error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
