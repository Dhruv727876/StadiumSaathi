import { useState, useCallback } from 'react';
import { logStadiumEvent } from '../firebase';

/**
 * Result structure returned by the useMainHook.
 */
export interface UseMainHookResult {
  /** The response payload returned by the AI */
  response: string;
  /** Active loading status flag */
  loading: boolean;
  /** Captured request or validation error message */
  error: string | null;
  /** Resolves and posts a message to the backend Express server */
  sendMessage: (message: string, language: string, accessibilityProfile?: string) => Promise<void>;
  /** Resets the active error state */
  resetError: () => void;
}

/**
 * Hook to coordinate AI query state parameters, analytics events, and server communication.
 *
 * @param apiUrl - Base destination URL for the API server.
 * @returns State properties and callbacks to send inputs.
 */
export function useMainHook(apiUrl: string): UseMainHookResult {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(async (
    message: string,
    language: string,
    accessibilityProfile?: string
  ) => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse('');
    logStadiumEvent('send_ai_query', { length: message.length });

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          language,
          accessibilityProfile
        })
      });

      const data = await res.json();
      if (res.status === 200 && data.success) {
        setResponse(data.response);
      } else {
        setError(data.message || 'Failed to get response');
      }
    } catch (err) {
      setError('Network request failed');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  return {
    response,
    loading,
    error,
    sendMessage,
    resetError
  };
}
