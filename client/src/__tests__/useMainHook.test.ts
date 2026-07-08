import { renderHook, act } from '@testing-library/react';
import { useMainHook } from '../hooks/useMainHook';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useMainHook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('1. should initialize with default states', () => {
    const { result } = renderHook(() => useMainHook('http://localhost:5000'));
    expect(result.current.response).toEqual('');
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('2. should refuse empty input queries and set local error', async () => {
    const { result } = renderHook(() => useMainHook('http://localhost:5000'));
    
    await act(async () => {
      await result.current.sendMessage('', 'en');
    });

    expect(result.current.error).toEqual('Message cannot be empty');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('3. should toggle loading status on API requests', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ success: true, response: 'Hi' })
    });

    const { result } = renderHook(() => useMainHook('http://localhost:5000'));

    let promise: Promise<void>;
    act(() => {
      promise = result.current.sendMessage('Hello', 'en');
    });

    expect(result.current.loading).toBeTruthy();

    await act(async () => {
      await promise;
    });

    expect(result.current.loading).toBeFalsy();
  });

  it('4. should process valid API requests and store the response', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ success: true, response: 'STADIUM_GUIDANCE: Walk to Sector C' })
    });

    const { result } = renderHook(() => useMainHook('http://localhost:5000'));

    await act(async () => {
      await result.current.sendMessage('How to get to Sector C?', 'en');
    });

    expect(result.current.response).toEqual('STADIUM_GUIDANCE: Walk to Sector C');
    expect(result.current.error).toBeNull();
  });

  it('5. should capture API error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 400,
      json: async () => ({ success: false, message: 'Bad request payload' })
    });

    const { result } = renderHook(() => useMainHook('http://localhost:5000'));

    await act(async () => {
      await result.current.sendMessage('Hello', 'en');
    });

    expect(result.current.error).toEqual('Bad request payload');
    expect(result.current.response).toEqual('');
  });

  it('6. should handle network connection failures', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network offline'));

    const { result } = renderHook(() => useMainHook('http://localhost:5000'));

    await act(async () => {
      await result.current.sendMessage('Hello', 'en');
    });

    expect(result.current.error).toEqual('Network request failed');
  });

  it('7. should clear and reset errors using resetError', async () => {
    const { result } = renderHook(() => useMainHook('http://localhost:5000'));

    await act(async () => {
      await result.current.sendMessage('', 'en');
    });

    expect(result.current.error).toEqual('Message cannot be empty');

    act(() => {
      result.current.resetError();
    });

    expect(result.current.error).toBeNull();
  });
});
