/**
 * Utility functions for managing URL parameters
 */

/**
 * Update the URL with session ID as a query parameter
 */
export function updateUrlWithSessionId(sessionId: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('session_id', sessionId);
  window.history.replaceState({}, '', url.toString());
}

/**
 * Get session ID from URL query parameters
 */
export function getSessionIdFromUrl(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get('session_id');
}

/**
 * Remove session ID from URL query parameters
 */
export function removeSessionIdFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('session_id');
  window.history.replaceState({}, '', url.toString());
}

/**
 * Clear all URL parameters
 */
export function clearUrlParams(): void {
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, '', url.toString());
}