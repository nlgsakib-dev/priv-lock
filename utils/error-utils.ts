let _error: string | null = null

/**
 * Stores the latest error string (and logs it in the console).
 * Components can import and call this if they don’t have their own local error state.
 */
export function setError(message: string) {
  _error = message
  // eslint-disable-next-line no-console
  console.error(`[Mixion] ${message}`)
}

/** Optional helper in case a component wants to read the last error. */
export function getError() {
  return _error
}
