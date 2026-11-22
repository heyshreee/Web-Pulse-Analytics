import { describe, it, expect } from 'vitest';
import { getSnippets, getSnippetLanguage } from '../src/utils/snippetGenerator.js';

describe('V2 Beta Dashboard Smoke Tests', () => {
  it('initializes snippetGenerator and creates valid client snippets', () => {
    const snippets = getSnippets({
      trackingId: 'test-v2-track-id',
      trackingUrl: 'http://localhost:3000/api/v1/track/test-v2-track-id',
      project: { name: 'Test Beta Observatory' },
    });

    expect(snippets).toBeDefined();
    expect(snippets.vanilla).toContain('test-v2-track-id');
    expect(snippets.vanilla).toContain('/track/script.js');
    expect(snippets.react).toContain('test-v2-track-id');
    expect(snippets.node).toContain('test-v2-track-id');
    expect(snippets.python).toContain('test-v2-track-id');
    expect(getSnippetLanguage('react')).toBe('javascript');
    expect(getSnippetLanguage('python')).toBe('python');
  });
});
