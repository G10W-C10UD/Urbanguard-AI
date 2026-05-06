// Custom hook for consuming Groq SSE streams in UrbanGuard-AI
import { useState, useCallback, useRef } from 'react';

export function useGroqStream() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  const startStream = useCallback(async (endpoint, options = {}) => {
    if (eventSourceRef.current) {
      if (typeof eventSourceRef.current.abort === 'function') {
        eventSourceRef.current.abort();
      } else {
        eventSourceRef.current.close();
      }
    }
    
    const abortController = new AbortController();
    eventSourceRef.current = abortController;

    setText('');
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('urbanguard_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: abortController.signal
      });

      if (!response.ok) throw new Error('Stream request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              setLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) setText(prev => prev + parsed.text);
            } catch (e) {
              console.warn('Failed to parse stream chunk:', e);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // Ignore aborts
      setError('AI is temporarily unavailable. Please try again.');
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (eventSourceRef.current && typeof eventSourceRef.current.abort === 'function') {
      eventSourceRef.current.abort();
    }
    setText('');
    setError(null);
    setLoading(false);
  }, []);

  return { text, loading, error, startStream, reset };
}
